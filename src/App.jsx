import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaDownload,
  FaCode,
  FaDatabase,
  FaCloud,
  FaMobile,
  FaDesktop,
  FaServer,
  FaRocket,
  FaArrowRight,
  FaStar,
  FaHeart,
  FaLightbulb,
  FaAward,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaPlay,
  FaExternalLinkAlt,
  FaBriefcase
} from 'react-icons/fa'
import { HiMenu, HiX } from 'react-icons/hi'

// Custom Upwork Icon Component
const UpworkIcon = ({ size = 20, className = "" }) => (
  <div 
    className={`bg-black rounded-full flex items-center justify-center text-white font-bold ${className}`}
    style={{ 
      fontSize: '0.875rem',
      lineHeight: 1
    }}
  >
    up
  </div>
)

// Small inline SR logo for UI usage
const SRLogoMark = ({ size = 24 }) => (
  <span
    aria-hidden
    className="inline-flex items-center justify-center rounded-full"
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      color: '#fff',
      fontWeight: 800,
      fontSize: size * 0.45 + 'px',
      lineHeight: 1
    }}
  >
    SR
  </span>
)

// Gather all images from assets (Vite)
const ASSET_IMAGES = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg,webp,gif}', { eager: true, query: '?url', import: 'default' })
const ASSET_VIDEOS = import.meta.glob('/src/assets/**/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })
const normalizePrefixes = (p) => (Array.isArray(p) ? p.filter(Boolean) : [p].filter(Boolean))
const buildGallery = (prefixOrPrefixes) => {
  const prefixes = normalizePrefixes(prefixOrPrefixes)
  if (!prefixes.length) return []
  const entries = Object.entries(ASSET_IMAGES)
  return entries
    .filter(([path]) => prefixes.some(pref => path.toLowerCase().includes(`/src/assets/${pref.toLowerCase()}`)))
    .map(([, url]) => url)
}
const buildVideos = (prefixOrPrefixes) => {
  const prefixes = normalizePrefixes(prefixOrPrefixes)
  if (!prefixes.length) return []
  const entries = Object.entries(ASSET_VIDEOS)
  return entries
    .filter(([path]) => prefixes.some(pref => path.toLowerCase().includes(`/src/assets/${pref.toLowerCase()}`)))
    .map(([, url]) => url)
}
const getMainImageForProject = (project) => {
  const gallery = buildGallery(project.galleryPrefixes || project.galleryPrefix)
  return (gallery && gallery.length ? gallery[0] : project.image)
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null
  const [countdown, setCountdown] = useState(0)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const openProjectDetails = (project) => { setActiveGalleryIndex(0); setSelectedProject(project) }
  const closeProjectDetails = () => setSelectedProject(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-dismiss success message after 5 seconds with countdown
  useEffect(() => {
    if (submitStatus === 'success') {
      setCountdown(5)
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setSubmitStatus(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [submitStatus])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    const performScroll = () => {
      if (!element) return
      const y = element.getBoundingClientRect().top + window.pageYOffset - 70 // account for fixed nav
      window.scrollTo({ top: y, behavior: 'smooth' })
    }

    // If mobile menu is open, close it first then scroll after animation
    if (isMenuOpen) {
      setIsMenuOpen(false)
      setTimeout(performScroll, 300)
    } else {
      performScroll()
    }
  }

  // Validation functions
  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required'
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters'
        }
        break
      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'message':
        if (!value.trim()) {
          error = 'Message is required'
        } else if (value.trim().length < 10) {
          error = 'Message must be at least 10 characters'
        }
        break
      default:
        break
    }
    
    return error
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // Contact form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Only show errors on blur if form has been submitted before
    if (submitStatus === 'error' || Object.keys(touched).length > 0) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      message: true
    })

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      // Initialize EmailJS with your public key
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
      
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: import.meta.env.VITE_CONTACT_EMAIL
      }

      // Send email using EmailJS
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID, // Your service ID
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // Your template ID
        templateParams
      )

      if (result.status === 200) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate static particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Static Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      {/* Static Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}

      {/* Mouse Follower */}
      <div 
        className="fixed w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
            >
              <SRLogoMark size={22} />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Saif Rehman</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              {['home', 'about', 'skills', 'projects', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize font-medium transition-all duration-300 relative group text-sm lg:text-base ${
                    activeSection === item
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-white/10"
            >
              <div className="px-4 py-3 space-y-2">
                {['home', 'about', 'skills', 'projects', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium capitalize transition-colors ${
                      activeSection === item
                        ? 'text-purple-400 bg-purple-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh]">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                  <FaStar />
                  <span>Full Stack Developer</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Crafting Digital
                  </span>
                  <br />
                  <span className="text-white">Experiences</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-lg leading-relaxed">
                  Transforming ideas into exceptional web solutions with cutting-edge technology and creative design.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    console.log('CV download clicked');
                    try {
                      const link = document.createElement('a');
                      link.href = `${import.meta.env.BASE_URL}Saif_ur_Rehman_CV.pdf?t=${Date.now()}`;
                      link.download = 'Saif_ur_Rehman_CV.pdf';
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      console.log('CV download initiated');
                    } catch (error) {
                      console.error('CV download error:', error);
                      // Fallback: open in new tab
                      window.open(`${import.meta.env.BASE_URL}Saif_ur_Rehman_CV.pdf`, '_blank');
                    }
                  }}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden text-sm sm:text-base"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <FaDownload />
                    Download CV
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 border-2 border-purple-400 text-purple-400 font-semibold rounded-xl hover:bg-purple-400 hover:text-white transition-all duration-300 transform hover:scale-105 text-sm sm:text-base overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <FaPlay />
                    View Projects
                  </span>
                  <div className="absolute inset-0 bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </div>

              <div className="flex space-x-4 sm:space-x-6">
                {[
                  { icon: FaGithub, href: import.meta.env.VITE_GITHUB_URL, label: "GitHub", isExternal: true },
                  { icon: FaLinkedin, href: import.meta.env.VITE_LINKEDIN_URL, label: "LinkedIn", isExternal: true },
                  { icon: FaEnvelope, href: `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`, label: "Email", isExternal: false },
                  { icon: UpworkIcon, href: import.meta.env.VITE_UPWORK_URL, label: "Upwork", isExternal: true }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target={social.isExternal ? "_blank" : undefined}
                    rel={social.isExternal ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.2,
                      y: -5,
                      rotate: 5
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="group relative p-2 sm:p-3 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <div>
                      <social.icon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <motion.div 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-400 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                    >
                      {social.label}
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative z-10">
                <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full"></div>
                  <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                    <div className="text-white text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      SR
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-6 h-6 sm:w-8 sm:h-8 bg-purple-400 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-4 -left-4 w-4 h-4 sm:w-6 sm:h-6 bg-blue-400 rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 -left-8 w-3 h-3 bg-pink-400 rounded-full opacity-50"></div>
                  <div className="absolute top-1/4 -right-6 w-2 h-2 bg-cyan-400 rounded-full opacity-50"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Section - Filling empty space */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 sm:mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { number: "20+", label: "Projects Completed", icon: FaCheckCircle, color: "from-green-400 to-emerald-400" },
              { number: "3+", label: "Years Experience", icon: FaClock, color: "from-blue-400 to-cyan-400" },
              { number: "100%", label: "Client Satisfaction", icon: FaHeart, color: "from-pink-400 to-rose-400" },
              { number: "24/7", label: "Support Available", icon: FaUsers, color: "from-purple-400 to-indigo-400" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  rotateY: 5
                }}
                className="group relative text-center p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to right, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})` }}
                />
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300 text-xs sm:text-sm">
                  <stat.icon size={16} className="text-purple-400 sm:w-4 sm:h-4" />
                  <span>{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              About Me
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              I'm a passionate Full Stack Developer who loves creating innovative solutions. 
              Every project is an opportunity to push boundaries and deliver exceptional experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              {
                icon: <FaCode size={28} className="sm:w-8 sm:h-8" />,
                title: "Frontend Excellence",
                description: "Building responsive, interactive UIs with React, Angular, Ionic, and modern CSS frameworks.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: <FaServer size={28} className="sm:w-8 sm:h-8" />,
                title: "Backend Mastery",
                description: "Creating robust APIs and server-side applications with Node.js, Python, NestJS, and databases.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <FaRocket size={28} className="sm:w-8 sm:h-8" />,
                title: "DevOps & Deployment",
                description: "Streamlining deployment with Docker, AWS, and CI/CD pipelines for seamless delivery.",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  rotateY: 5
                }}
                className="group relative p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className={`text-center mb-4 p-2 sm:p-3 rounded-xl bg-gradient-to-r ${item.gradient} w-fit mx-auto`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 text-center">{item.title}</h3>
                <p className="text-gray-300 text-center leading-relaxed text-sm sm:text-base">{item.description}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>

          {/* Additional Content - Filling space */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6 sm:gap-8"
          >
            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaAward className="text-yellow-400" />
                Achievements
              </h3>
              <div className="space-y-3">
                {[
                  "UX that moves as fast as your ideas.",
                  "10+ Happy Clients",
                  "20+ Successful Projects",
                  "3+ Years of Excellence"
                ].map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-gray-300 text-sm sm:text-base"
                  >
                    <FaCheckCircle className="text-green-400 flex-shrink-0" />
                    <span>{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaLightbulb className="text-purple-400" />
                What I Do
              </h3>
              <div className="space-y-3">
                {[
                  "Full Stack Web Development",
                  "Mobile App Development",
                  "UI/UX Design",
                  "Cloud Infrastructure"
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-gray-300 text-sm sm:text-base"
                  >
                    <FaStar className="text-purple-400 flex-shrink-0" />
                    <span>{service}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Skills & Technologies
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Mastering the tools and technologies that power modern web applications.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { 
                category: "Frontend", 
                skills: ["React", "Angular", "TypeScript", "Ionic", "Next.js"],
                gradient: "from-purple-500 to-pink-500"
              },
              { 
                category: "Backend", 
                skills: ["Node.js", "Python", "Express.js", "NestJS", "FastAPI"],
                gradient: "from-blue-500 to-cyan-500"
              },
              { 
                category: "Database", 
                skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase"],
                gradient: "from-green-500 to-emerald-500"
              },
              { 
                category: "Tools", 
                skills: ["Git", "Docker", "AWS", "Vercel", "Figma"],
                gradient: "from-orange-500 to-red-500"
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.gradient}`}></div>
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div 
                      key={skillIndex} 
                      className="flex items-center justify-between group"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: skillIndex * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base">{skill}</span>
                      <div className="w-16 sm:w-20 h-2 bg-gray-700 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full bg-gradient-to-r ${category.gradient} rounded-full relative`}
                          style={{ width: `${85 + Math.random() * 15}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Skills Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              {
                title: "Development Process",
                items: ["Agile Methodology", "Code Review", "Testing", "Documentation"],
                icon: FaCode,
                color: "text-blue-400"
              },
              {
                title: "Performance",
                items: ["Optimization", "SEO", "Accessibility", "Security"],
                icon: FaRocket,
                color: "text-green-400"
              },
              {
                title: "Collaboration",
                items: ["Team Work", "Communication", "Mentoring", "Leadership"],
                icon: FaUsers,
                color: "text-purple-400"
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className={`text-xl sm:text-2xl mb-4 ${section.color}`}>
                  <section.icon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">{section.title}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="text-gray-300 text-xs sm:text-sm flex items-center gap-2">
                      <FaCheckCircle className="text-green-400 text-xs" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Featured Projects
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Showcasing my creativity and technical expertise through innovative projects.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              {
                title: "Atomix – 3PL Fulfillment Platform",
                description: "Atomix is a modern third‑party logistics (3PL) platform that streamlines order fulfillment, reduces shipping costs, and scales globally. It delivers real‑time order tracking, AI‑powered carrier selection, 2‑day nationwide delivery, Amazon FBA/FBM support, and custom packaging from one easy dashboard. I contributed to feature development and optimization, integrated Shopify/Amazon/WooCommerce, and enhanced shipping automation for faster, more efficient deliveries.",
                tech: ["React", "NestJS", "Shopify", "Amazon", "WooCommerce", "Automation"],
                image: ASSET_IMAGES['/src/assets/atomix/image_original.png'],
                galleryPrefix: 'atomix'
              },
              {
                title: "EquipX – Equipment Marketplace",
                description: "equipX is a full‑featured heavy equipment marketplace and asset management platform. It enables users to list, buy, sell, finance, and manage machinery like excavators, trailers, and skid steers. I developed the searchable listing system, implemented financing and logistics modules, and built a real‑time chat feature with group messaging. The platform connects local buyers and sellers, streamlines transactions, improves communication, and supports secure, community‑driven equipment exchanges.",
                tech: ["Angular", "Node.js", "MongoDB", "Realtime Chat"],
                image: ASSET_IMAGES['/src/assets/equipx/cover.png'] || ASSET_IMAGES['/src/assets/equipX/image_original.png'],
                galleryPrefix: 'equipx'
              },
              {
                title: "SandSeekers – Real Estate Platform",
                description: "Led the development of a complete real estate platform for Dubai, allowing users to buy, rent, or explore residential and commercial properties. Built a custom CRM to manage listings, leads, and real-time property data from Bayut, Dubizzle, and Property Finder. Users can book property demos and view the latest projects. I handled client communication, gathered requirements, and managed the entire development team.",
                tech: ["Next.js", "Node.js", "MongoDB", "CRM", "Integrations"],
                image: ASSET_IMAGES['/src/assets/sandseerks/cover.png'] || ASSET_IMAGES['/src/assets/sandseekers/image_original.png'],
                galleryPrefixes: ['sandseerks', 'sandseekers']
              },
              {
                title: "99DPF – DPF Cleaning Service Platform",
                description: "99DPF is a digital platform that helps users schedule diesel particulate filter (DPF) cleanings, track orders, communicate with service partners, and manage bookings with a 30-day guarantee. It supports both customers and partners with real-time chat, push notifications, image uploads, and order status updates—accessible via web and mobile apps.",
                tech: ["React", "React Native", "Node.js", "MongoDB", "Realtime Chat", "Push Notifications"],
                image: ASSET_IMAGES['/src/assets/99dpf/image_original.png'],
                galleryPrefix: '99dpf'
              },
              {
                title: "GGamer – Gaming, News & Streaming Platform (UI)",
                description: "GGamer is a responsive web platform for live gaming competitions, eSports news, and game streaming. I handled complete frontend UI development using modern technologies. The design is fast and tailored for gamers, including real‑time match updates, player stats, trending news, and embedded streams.",
                tech: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Streaming"],
                image: ASSET_IMAGES['/src/assets/gGamer/image_original.png'] || ASSET_IMAGES['/src/assets/ggamer/image_original.png'],
                galleryPrefixes: ['ggamer', 'gGamer']
              },
              {
                title: "CorporateMerch.com – AI-Powered Merchandise Platform",
                description: "CorporateMerch.com is a platform that helps businesses easily design and order branded merchandise like t-shirts, mugs, tech items, and more. It uses AI to create custom designs in seconds, making the process fast and simple. Companies can use it to send gifts to clients, employees, or partners. The site also connects with tools like CRM systems to automate sending gifts. It's great for corporate gifting, event giveaways, or boosting brand awareness. Overall, it makes it easy for any company to manage and send custom swag.",
                tech: ["Next.js", "Tailwind CSS", "AI Integration", "CRM Systems", "E-commerce"],
                image: ASSET_IMAGES['/src/assets/corporate_merch/Pasted image.png'],
                galleryPrefix: 'corporate_merch'
              }
            ].map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  y: -15,
                  rotateY: 10
                }}
                whileTap={{ scale: 0.99 }}
                className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="h-40 sm:h-48 md:h-52 lg:h-56 relative overflow-hidden">
                  <img src={getMainImageForProject(project)} alt={project.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base truncate">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                      <motion.span 
                        key={techIndex} 
                        className="px-2 sm:px-3 py-1 bg-white/10 text-white rounded-full text-xs sm:text-sm backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: techIndex * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <motion.button 
                      onClick={() => openProjectDetails(project)}
                      className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPlay size={10} className="sm:w-3 sm:h-3" />
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Project Details Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  {(() => {
                    const gallery = buildGallery(selectedProject.galleryPrefixes || selectedProject.galleryPrefix)
                    const videos = buildVideos(selectedProject.galleryPrefixes || selectedProject.galleryPrefix)
                    const images = gallery.length ? gallery : [selectedProject.image]
                    const media = [...videos, ...images] // videos first so first video is default hero
                    const active = media[Math.min(activeGalleryIndex, media.length - 1)]
                    const isActiveVideo = videos.includes(active)
                    return (
                      <>
                        <div className="relative bg-black/20 flex-shrink-0">
                          <button onClick={closeProjectDetails} aria-label="Close modal" className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 z-10">
                            <HiX size={18} />
                          </button>
                          {isActiveVideo ? (
                            <video src={active} className="w-full h-auto max-h-[45vh] sm:max-h-[55vh] bg-slate-900" controls playsInline />
                          ) : (
                            <img src={active} alt={selectedProject.title} className="w-full h-auto max-h-[45vh] sm:max-h-[55vh] object-contain bg-slate-900" />
                          )}
                        </div>
                        {media.length > 1 && (
                          <div className="bg-slate-950/40 border-b border-white/10 overflow-x-auto">
                            <div className="p-3 flex items-center gap-2 min-w-max">
                              {media.map((src, idx) => {
                                const isVideo = videos.includes(src)
                                return (
                                  <button key={idx} onClick={() => setActiveGalleryIndex(idx)} className={`relative rounded-lg overflow-hidden border ${idx === activeGalleryIndex ? 'border-purple-400' : 'border-white/10'}`}>
                                    {isVideo ? (
                                      <div className="w-20 h-14 sm:w-24 sm:h-16 bg-black/60 flex items-center justify-center text-white text-[10px]">Video</div>
                                    ) : (
                                      <img src={src} alt={`thumb-${idx}`} className="w-20 h-14 sm:w-24 sm:h-16 object-cover" />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        <div className="p-4 sm:p-6 overflow-y-auto">
                          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{selectedProject.title}</h3>
                          <p className="text-gray-300 mb-5 leading-relaxed whitespace-pre-line">{selectedProject.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.tech.map((t, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">{t}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Let's Create Together
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
              Ready to bring your ideas to life? Let's discuss how we can work together on your next project!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6 sm:gap-8"
          >
            <div className="space-y-6">
              <div className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  Get In Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300">
                      <FaEnvelope className="text-purple-400 sm:w-5 sm:h-5" size={18} />
                    </div>
                    <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`} className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base hover:underline">{import.meta.env.VITE_CONTACT_EMAIL}</a>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300">
                      <FaLinkedin className="text-blue-400 sm:w-5 sm:h-5" size={18} />
                    </div>
                    <a href={import.meta.env.VITE_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base hover:underline">LinkedIn Profile</a>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-gray-500/20 rounded-lg group-hover:bg-gray-500/30 transition-colors duration-300">
                      <FaGithub className="text-gray-400 sm:w-5 sm:h-5" size={18} />
                    </div>
                    <a href={import.meta.env.VITE_GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base hover:underline">GitHub Profile</a>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors duration-300">
                      <UpworkIcon />
                    </div>
                    <a href={import.meta.env.VITE_UPWORK_URL} target="_blank" rel="noopener noreferrer" className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base hover:underline">Upwork Profile</a>
                  </div>
                </div>
              </div>

              {/* Additional Contact Info */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-400" />
                  Availability
                </h3>
                <div className="space-y-2 text-gray-300 text-sm sm:text-base">
                  <div>✅ Available for new projects</div>
                  <div>✅ Quick response time</div>
                  <div>✅ Flexible working hours</div>
                  <div>✅ Remote collaboration</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name Field */}
              <div className="space-y-1">
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-400 focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm sm:text-base ${
                    errors.name && touched.name
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 focus:ring-purple-500/50'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                />
                {errors.name && touched.name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-xs"
                  >
                    <span className="text-red-500">⚠</span>
                    {errors.name}
                  </motion.div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <motion.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Your Email"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-400 focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm sm:text-base ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 focus:ring-purple-500/50'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                />
                {errors.email && touched.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-xs"
                  >
                    <span className="text-red-500">⚠</span>
                    {errors.email}
                  </motion.div>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-1">
                <motion.textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Your Message"
                  rows="4"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-400 focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none text-sm sm:text-base ${
                    errors.message && touched.message
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 focus:ring-purple-500/50'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                />
                {errors.message && touched.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-xs"
                  >
                    <span className="text-red-500">⚠</span>
                    {errors.message}
                  </motion.div>
                )}
              </div>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm"
                >
                  ✅ Message sent successfully! I'll get back to you soon.
                </motion.div>
              )}
              
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  ❌ Failed to send message. Please try again or contact me directly at {import.meta.env.VITE_CONTACT_EMAIL}
                </motion.div>
              )}
              
              <motion.button 
                type="submit"
                disabled={isSubmitting || (Object.keys(errors).some(key => errors[key] && touched[key]))}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isSubmitting || (Object.keys(errors).some(key => errors[key] && touched[key]))
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl'
                }`}
                whileHover={!isSubmitting && !Object.keys(errors).some(key => errors[key] && touched[key]) ? { 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                } : {}}
                whileTap={!isSubmitting && !Object.keys(errors).some(key => errors[key] && touched[key]) ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </span>
                {!isSubmitting && (
                  <div>
                    <FaArrowRight />
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm sm:text-base">
          © 2024 Saif Rehman. Turning ideas <FaLightbulb className="inline text-purple-400" /> into impactful web solutions.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
