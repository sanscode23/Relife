import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './App.css'
import { api } from './services/api.js'

const initialDevice = {
  type: '',
  brand: '',
  model: '',
  year: '',
  condition: '',
  issues: '',
  repairCost: '',
  userWantsToSell: true,
}

const CURRENT_YEAR = new Date().getFullYear()

const safetySteps = [
  ['backup', 'Back up what matters', 'Save photos, contacts, and files to a trusted location.'],
  ['accountsRemoved', 'Sign out of accounts', 'Remove linked accounts and disable device tracking.'],
  ['encryptionChecked', 'Check encryption', 'Confirm the device’s storage protection and recovery settings.'],
  ['factoryReset', 'Factory reset the device', 'Use the manufacturer’s reset process before handing it over.'],
  ['storageSanitized', 'Sanitize the storage', 'Use a suitable secure erase process for the storage type.'],
]

const pathwayOptions = [
  ['CONTINUE_OR_REPAIR', 'Continue using or repair'],
  ['SELL_OR_DONATE', 'Sell or donate'],
  ['REPURPOSE', 'Repurpose'],
  ['RECYCLE', 'Recycle responsibly'],
]

const navigation = [
  ['home', 'Home'],
  ['assess', 'Assess device'],
  ['safety', 'Data safety'],
  ['certificate', 'Certificate'],
  ['verify', 'Verify'],
]

function getVerificationRoute() {
  const match = window.location.pathname.match(/^\/verify\/([^/]+)\/?$/)
  if (!match) return null
  try {
    return { verificationId: decodeURIComponent(match[1]), error: '' }
  } catch {
    return { verificationId: '', error: 'This verification link is invalid.' }
  }
}

function Icon({ name, size = 20 }) {
  const paths = {
    leaf: <><path d="M20 4c-8 0-14 4-14 11a5 5 0 0 0 5 5c7 0 11-6 9-16Z" /><path d="M4 21c2-5 6-9 12-12" /></>,
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    recycle: <><path d="m7 19-3-5 3-5" /><path d="M4 14h11" /><path d="m17 5 3 5-3 5" /><path d="M20 10H9" /><path d="m12 3 3 2-3 2" /><path d="m12 21-3-2 3-2" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    print: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
    chat: <><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.1-4.1A8.5 8.5 0 1 1 21 11.5Z" /><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" /></>,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  }
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

const quickReplies = [
  'How do I assess my device?',
  'What does my recommendation mean?',
  'How do I protect my data?',
  'How do I get my certificate?',
]

function getHelpReply(question) {
  const text = question.toLowerCase()
  if (text.includes('data') || text.includes('privacy') || text.includes('back up') || text.includes('backup') || text.includes('sign out') || text.includes('erase')) {
    return {
      text: 'For a transfer or donation, the backend requires all five safety checks: backup, account removal, encryption check, factory reset, and storage sanitization. Choose “Sell or donate” as your pathway first. Follow the device maker’s instructions for a complete erase.',
      action: 'safety',
      actionLabel: 'Open the data safety checklist',
    }
  }
  if (text.includes('certificate') || text.includes('print') || text.includes('pdf')) {
    return {
      text: 'A certificate is issued by the backend after an assessment, selecting “Sell or donate”, and completing all five safety checks. You can then print it or open its public verification link.',
      action: 'certificate',
      actionLabel: 'Go to your certificate',
    }
  }
  if (text.includes('assessment') || text.includes('assess') || text.includes('score') || text.includes('start')) {
    return {
      text: 'Open Assess device and enter its type, brand, model, purchase year, condition, and estimated repair cost in rupees. Select “Get my recommendation” to save the device and request its backend assessment.',
      action: 'assess',
      actionLabel: 'Start an assessment',
    }
  }
  if (text.includes('verify') || text.includes('qr')) {
    return {
      text: 'Enter a certificate ID in Verify, or scan the QR code on a server-issued certificate. Verification looks up the certificate using the backend’s public endpoint.',
      action: 'verify',
      actionLabel: 'Verify a certificate',
    }
  }
  if (text.includes('repair') || text.includes('recycle') || text.includes('reuse') || text.includes('recommendation') || text.includes('recommend')) {
    return {
      text: 'Your recommendation is a starting point based on the condition, age, and estimated repair cost you entered. Repair keeps a working device in use; reuse means it may suit someone else; responsible recycling helps keep e-waste out of landfill. Check your results for the reason and next steps.',
      action: 'results',
      actionLabel: 'View assessment results',
    }
  }
  return {
    text: 'I can help you assess a device, understand a repair/reuse/recycle recommendation, protect your data, or find your certificate. Choose one of the suggestions below, or ask me another way.',
    action: null,
    actionLabel: null,
  }
}

function App() {
  const [activeSection, setActiveSection] = useState(() => getVerificationRoute() ? 'verify' : 'home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [device, setDevice] = useState(initialDevice)
  const [errors, setErrors] = useState({})
  const [assessment, setAssessment] = useState(null)
  const [deviceId, setDeviceId] = useState('')
  const [registeredDeviceSnapshot, setRegisteredDeviceSnapshot] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [safetyChecklist, setSafetyChecklist] = useState({})
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [pathLoading, setPathLoading] = useState(false)
  const [safetyLoading, setSafetyLoading] = useState('')
  const [certificateLoading, setCertificateLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [safetyError, setSafetyError] = useState('')
  const [certificateError, setCertificateError] = useState('')
  const [certificate, setCertificate] = useState(null)
  const [verifyId, setVerifyId] = useState(() => getVerificationRoute()?.verificationId || '')
  const [verificationStatus, setVerificationStatus] = useState(() => {
    const route = getVerificationRoute()
    return route ? (route.error ? 'error' : 'loading') : 'idle'
  })
  const [verifiedCertificate, setVerifiedCertificate] = useState(null)
  const [verificationError, setVerificationError] = useState(() => getVerificationRoute()?.error || '')
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpInput, setHelpInput] = useState('')
  const [helpMessages, setHelpMessages] = useState([
    { id: 1, sender: 'assistant', text: "Hi! I'm your RE guide 🌱 How can I help?" },
  ])
  const helpInputRef = useRef(null)
  const helpMessagesRef = useRef(null)
  const helpMessageIdRef = useRef(2)

  const certificateId = certificate?.verificationId || ''
  const checkedCount = safetySteps.filter(([key]) => safetyChecklist[key]?.done).length
  const recommendation = assessment?.recommendation
  const recommendationAction = recommendation?.action || ''
  const recommendationLabel = recommendationAction
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  const recommendationKind = ['RECYCLE', 'COMPONENT_RECOVERY'].includes(recommendationAction)
    ? 'recycle'
    : ['SELL', 'DONATE', 'REPURPOSE', 'REPAIR_AND_RESELL'].includes(recommendationAction)
      ? 'reuse'
      : 'repair'
  const publicVerifyUrl = certificateId
    ? `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`
    : ''

  useEffect(() => {
    if (helpOpen) helpInputRef.current?.focus()
  }, [helpOpen])

  useEffect(() => {
    helpMessagesRef.current?.scrollTo({ top: helpMessagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [helpMessages])

  useEffect(() => {
    if (!helpOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setHelpOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [helpOpen])

  useEffect(() => {
    const route = getVerificationRoute()
    if (!route?.verificationId) return undefined
    let cancelled = false
    api.getPublicCertificate(route.verificationId)
      .then((data) => {
        if (cancelled) return
        setVerifiedCertificate(data.certificate)
        setVerificationStatus('success')
      })
      .catch((error) => {
        if (cancelled) return
        setVerificationError(error.message)
        setVerificationStatus('error')
      })

    return () => { cancelled = true }
  }, [])

  const goTo = (section) => {
    setActiveSection(section)
    setMenuOpen(false)
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateDevice = (event) => {
    const { name, value } = event.target
    if (device[name] !== value) {
      setDeviceId('')
      setRegisteredDeviceSnapshot('')
      setAssessment(null)
      setSelectedPath('')
      setSafetyChecklist({})
      setCertificate(null)
      setApiError('')
    }
    setDevice((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submitAssessment = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!device.type) nextErrors.type = 'Choose a device type.'
    if (!device.brand.trim()) nextErrors.brand = 'Enter the brand.'
    if (!device.model.trim()) nextErrors.model = 'Enter the model.'
    if (!device.year || Number(device.year) < 1990 || Number(device.year) > CURRENT_YEAR) nextErrors.year = 'Enter a valid purchase year.'
    if (!device.condition) nextErrors.condition = 'Select the current condition.'
    if (device.repairCost === '' || !Number.isFinite(Number(device.repairCost)) || Number(device.repairCost) < 0) nextErrors.repairCost = 'Enter an estimated cost of ₹0 or more.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const deviceTypes = {
      Smartphone: 'PHONE',
      Laptop: 'LAPTOP',
      Tablet: 'TABLET',
      'Desktop computer': 'DESKTOP',
      Router: 'ROUTER',
      Other: 'OTHER',
    }
    const conditions = { Good: 'GOOD', Fair: 'FAIR', Poor: 'POOR' }
    const payload = {
      deviceType: deviceTypes[device.type],
      brand: device.brand.trim(),
      model: device.model.trim(),
      purchaseYear: Number(device.year),
      condition: conditions[device.condition],
      issues: device.issues.split(/[\n,;]+/).map((issue) => issue.trim()).filter(Boolean),
      repairCost: Number(device.repairCost),
      userWantsToSell: Boolean(device.userWantsToSell),
    }
    const snapshot = JSON.stringify(payload)

    setAssessmentLoading(true)
    setApiError('')
    try {
      if (!localStorage.getItem('relife_token')) await api.startGuestSession()

      let currentDeviceId = deviceId
      if (!currentDeviceId || registeredDeviceSnapshot !== snapshot) {
        const registered = await api.registerDevice(payload)
        currentDeviceId = registered.deviceId
        if (!currentDeviceId) throw new Error('The API did not return a device ID.')
        setDeviceId(currentDeviceId)
        setRegisteredDeviceSnapshot(snapshot)
      }

      const result = await api.runAssessment(currentDeviceId)
      setAssessment(result)
      setSelectedPath('')
      setSafetyChecklist({})
      setCertificate(null)
      setActiveSection('results')
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 0)
    } catch (error) {
      setApiError(error.message)
    } finally {
      setAssessmentLoading(false)
    }
  }

  const choosePath = async (path) => {
    if (!deviceId) return
    setPathLoading(true)
    setApiError('')
    setSafetyError('')
    try {
      const result = await api.selectPath(deviceId, path)
      setSelectedPath(result.chosenPath)
      if (path === 'SELL_OR_DONATE') {
        const safety = await api.getSafetyChecklist(deviceId)
        setSafetyChecklist(safety.dataSafety?.items || {})
      } else {
        setSafetyChecklist({})
      }
    } catch (error) {
      setApiError(error.message)
    } finally {
      setPathLoading(false)
    }
  }

  const toggleSafetyStep = async (step) => {
    if (!deviceId || selectedPath !== 'SELL_OR_DONATE') return
    const done = !safetyChecklist[step]?.done
    setSafetyLoading(step)
    setSafetyError('')
    try {
      const result = await api.updateSafetyChecklist(deviceId, { [step]: { done } })
      setSafetyChecklist(result.dataSafety?.items || {})
    } catch (error) {
      setSafetyError(error.message)
    } finally {
      setSafetyLoading('')
    }
  }

  const issueCertificate = async () => {
    if (!deviceId || selectedPath !== 'SELL_OR_DONATE' || checkedCount !== safetySteps.length) return
    setCertificateLoading(true)
    setCertificateError('')
    try {
      const result = await api.generateCertificate(deviceId)
      setCertificate(result.certificate)
      if (!result.certificate?.verificationId) throw new Error('The API did not return a verification certificate ID.')
    } catch (error) {
      setCertificateError(error.message)
    } finally {
      setCertificateLoading(false)
    }
  }

  const verifyCertificate = async (event) => {
    event.preventDefault()
    const verificationId = verifyId.trim()
    if (!verificationId) {
      setVerificationStatus('error')
      setVerificationError('Enter a certificate ID to verify.')
      return
    }
    setVerificationStatus('loading')
    setVerificationError('')
    setVerifiedCertificate(null)
    try {
      const data = await api.getPublicCertificate(verificationId)
      setVerifiedCertificate(data.certificate)
      setVerificationStatus('success')
    } catch (error) {
      setVerificationError(error.message)
      setVerificationStatus('error')
    }
  }

  const askHelp = (question) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) return
    const response = getHelpReply(trimmedQuestion)
    if (response.action === 'results' && !assessment) {
      response.action = 'assess'
      response.actionLabel = 'Start an assessment'
    }
    const userMessageId = helpMessageIdRef.current
    helpMessageIdRef.current += 2
    setHelpMessages((current) => [
      ...current,
      { id: userMessageId, sender: 'user', text: trimmedQuestion },
      { id: userMessageId + 1, sender: 'assistant', ...response },
    ])
    setHelpInput('')
  }

  const submitHelp = (event) => {
    event.preventDefault()
    askHelp(helpInput)
  }

  const field = (name, label, control) => (
    <label className={`field ${errors[name] ? 'field-error' : ''}`} htmlFor={name}>
      <span>{label} <span className="required">*</span></span>
      {control}
      {errors[name] && <small className="error-message">{errors[name]}</small>}
    </label>
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="wordmark" onClick={() => goTo('home')} aria-label="RE home">
          <span className="brand-icon"><Icon name="leaf" size={21} /></span>
          <span>re<span className="wordmark-dot">.</span></span>
        </button>
        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          <Icon name="menu" />
        </button>
        <nav className={menuOpen ? 'navigation navigation-open' : 'navigation'} aria-label="Main navigation">
          {navigation.map(([id, label]) => (
            <button key={id} className={activeSection === id ? 'nav-link nav-active' : 'nav-link'} onClick={() => goTo(id)}>{label}</button>
          ))}
          <button className="nav-cta" onClick={() => goTo('assess')}>Start assessment <Icon name="arrow" size={16} /></button>
        </nav>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> BETTER TECH, LESS WASTE</div>
            <h1>Give your tech<br />a <span>thoughtful</span><br />next chapter.</h1>
            <p className="hero-lede">Not sure what to do with an old device? RE helps you find the most responsible next step — repair, reuse, or recycle.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => goTo('assess')}>Assess your device <Icon name="arrow" size={18} /></button>
              <button className="text-button" onClick={() => goTo('how-it-works')}>How it works <span className="play-icon">↓</span></button>
            </div>
            <div className="hero-proof"><div className="proof-avatars"><span>R</span><span>↻</span><span>+</span></div><span>A little care goes a long way.</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of a phone, sprouting plant, and circular reuse symbol" role="img">
            <div className="art-sun" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-leaf leaf-one" />
            <div className="art-leaf leaf-two" />
            <div className="art-leaf leaf-three" />
            <div className="plant-stem" />
            <div className="phone">
              <div className="phone-camera" /><div className="phone-screen"><span className="screen-sun" /><span className="screen-hill hill-one" /><span className="screen-hill hill-two" /><span className="screen-sprout" /></div><span className="phone-button" />
            </div>
            <div className="art-tag"><span className="tag-check"><Icon name="check" size={13} /></span> Ready for a fresh start</div>
            <div className="art-caption"><span>01 — 03</span><span>Keep good tech in motion</span></div>
          </div>
          <div className="hero-bottom"><span>DESIGNED FOR A MORE CIRCULAR FUTURE</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section id="how-it-works" className="intro-section section-wrap">
          <div className="section-kicker">A BETTER WAY FORWARD <span>✳</span></div>
          <div className="intro-grid">
            <h2>Good tech deserves<br />a <em>good next step.</em></h2>
            <div className="intro-content">
              <p>Every device has more than one possible ending. RE takes the guesswork out of what comes next — so you can make a choice that feels good for you and the planet.</p>
              <div className="value-points">
                <div><span className="value-number">01</span><span>Get a clear, personalized recommendation</span></div>
                <div><span className="value-number">02</span><span>Make your data safety part of the plan</span></div>
                <div><span className="value-number">03</span><span>Keep a record of your responsible choice</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="assess" className="assessment-section section-wrap">
          <div className="section-heading">
            <div><div className="section-kicker">LET'S START WITH YOUR DEVICE</div><h2>A few details.<br /><em>A clearer way forward.</em></h2></div>
            <p>Tell us a little about your device. We’ll help you explore a next step that makes sense.</p>
          </div>
          <form className="assessment-form" onSubmit={submitAssessment} noValidate>
            <div className="form-topline"><span>DEVICE DETAILS</span><span><b>*</b> REQUIRED FIELDS</span></div>
            <div className="form-grid">
              {field('type', 'Device type', <select id="type" name="type" value={device.type} onChange={updateDevice}><option value="">Select a device</option><option>Smartphone</option><option>Laptop</option><option>Tablet</option><option>Desktop computer</option><option>Router</option><option>Other</option></select>)}
              {field('brand', 'Brand', <input id="brand" name="brand" value={device.brand} onChange={updateDevice} placeholder="e.g. Apple, Samsung, Dell" />)}
              {field('model', 'Model', <input id="model" name="model" value={device.model} onChange={updateDevice} placeholder="e.g. iPhone 13, XPS 15" />)}
              {field('year', 'Purchase year', <input id="year" name="year" type="number" min="1990" max={CURRENT_YEAR} value={device.year} onChange={updateDevice} placeholder="e.g. 2021" />)}
              {field('condition', 'Current condition', <select id="condition" name="condition" value={device.condition} onChange={updateDevice}><option value="">How is it working?</option><option>Good</option><option>Fair</option><option>Poor</option></select>)}
              {field('repairCost', 'Estimated repair cost (₹)', <div className="input-prefix"><span>₹</span><input id="repairCost" name="repairCost" type="number" min="0" step="1" value={device.repairCost} onChange={updateDevice} placeholder="0" /></div>)}
              <label className="field field-full checkbox-field" htmlFor="userWantsToSell">
                <span>Resale / donation interest <span className="optional">(recommended)</span></span>
                <span className="checkbox-row">
                  <input id="userWantsToSell" name="userWantsToSell" type="checkbox" checked={Boolean(device.userWantsToSell)} onChange={(event) => updateDevice({ target: { name: 'userWantsToSell', value: event.target.checked } })} />
                  <span>I may want to sell or donate this device after assessment.</span>
                </span>
              </label>
              <label className="field field-full" htmlFor="issues"><span>What’s going on? <span className="optional">(optional)</span></span><textarea id="issues" name="issues" value={device.issues} onChange={updateDevice} rows="3" placeholder="Tell us about any issues, repairs, or quirks…"></textarea></label>
            </div>
            {apiError && <p className="app-alert" role="alert">{apiError}</p>}
            <div className="form-footer"><span><Icon name="shield" size={17} /> Saved securely to your guest account.</span><button className="button button-primary" type="submit" disabled={assessmentLoading}>{assessmentLoading ? 'Assessing your device…' : 'Get my recommendation'} {!assessmentLoading && <Icon name="arrow" size={18} />}</button></div>
          </form>
        </section>

        {assessment && <section id="results" className="results-section section-wrap">
          <div className="section-kicker">YOUR PERSONALIZED ASSESSMENT</div>
          <div className="results-heading"><div><h2>Here’s your device’s<br /><em>next chapter.</em></h2><p>Based on the details you shared, here’s a practical place to start.</p></div><div className="score-card"><div className="score-ring"><span>{recommendation?.score ?? '—'}</span><small>/100</small></div><span className="score-label">CIRCULARITY SCORE</span></div></div>
          <div className={`recommendation-card recommendation-${recommendationKind}`}>
            <div className="recommendation-icon"><Icon name={recommendationKind === 'recycle' ? 'recycle' : recommendationKind === 'reuse' ? 'spark' : 'leaf'} size={25} /></div>
            <div className="recommendation-copy"><span className="recommendation-label">BACKEND RECOMMENDATION</span><h3>{recommendationLabel || 'Assessment complete'}</h3><p>{recommendation?.aiExplanation || recommendation?.reason || 'The backend did not provide an explanation.'}</p></div>
            <div className="device-summary"><span>YOUR DEVICE</span><strong>{device.brand} {device.model}</strong><small>{device.type} · {device.year}</small></div>
          </div>
          <div className="next-steps-card"><div><div className="section-kicker">YOUR NEXT STEPS</div><h3>Small steps, real impact.</h3></div><ol>{(recommendation?.nextSteps || []).map((step, index) => <li key={`${index}-${step}`}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol></div>
          <div className="pathway-picker"><div><div className="section-kicker">CHOOSE YOUR PATHWAY</div><p>The recommendation is guidance. Choose a pathway to continue your device journey.</p></div><div className="pathway-options">{pathwayOptions.map(([path, label]) => <button key={path} className={`button button-outline ${selectedPath === path ? 'pathway-selected' : ''}`} type="button" onClick={() => choosePath(path)} disabled={pathLoading}>{label}</button>)}</div>{pathLoading && <p className="form-status" role="status">Saving your pathway…</p>}</div>
          {apiError && <p className="app-alert" role="alert">{apiError}</p>}
          <div className="result-links"><button className="button button-primary" onClick={() => goTo('safety')}>Prepare your device <Icon name="arrow" size={18} /></button><button className="button button-outline" onClick={() => goTo('certificate')}>View your certificate</button></div>
        </section>}

        <section id="safety" className="safety-section">
          <div className="safety-inner section-wrap">
            <div className="safety-copy"><div className="section-kicker">BEFORE IT LEAVES YOUR HANDS</div><h2>Your data deserves<br /><em>a safe goodbye.</em></h2><p>For resale or donation, the backend records five data-safety checks before it will issue a certificate.</p><div className="safety-progress"><span>{checkedCount} OF {safetySteps.length} COMPLETE</span><div className="progress-track"><span style={{ width: `${checkedCount / safetySteps.length * 100}%` }} /></div></div></div>
            <div className="checklist">
              {safetySteps.map(([id, title, description], index) => (
                <label className={`checklist-item ${safetyChecklist[id]?.done ? 'checklist-done' : ''}`} key={id}>
                  <input type="checkbox" checked={Boolean(safetyChecklist[id]?.done)} disabled={selectedPath !== 'SELL_OR_DONATE' || Boolean(safetyLoading)} onChange={() => toggleSafetyStep(id)} />
                  <span className="custom-check"><Icon name="check" size={16} /></span>
                  <span className="checklist-text"><strong>{title}</strong><small>{description}</small></span>
                  <span className="checklist-number">0{index + 1}</span>
                </label>
              ))}
              {selectedPath !== 'SELL_OR_DONATE' && <div className="safety-gate"><p>Select “Sell or donate” to save this checklist to your device journey.</p>{assessment && <button className="button button-outline" type="button" onClick={() => choosePath('SELL_OR_DONATE')} disabled={pathLoading}>Choose sell or donate</button>}</div>}
              {safetyError && <p className="app-alert" role="alert">{safetyError}</p>}
              <div className="privacy-note"><Icon name="shield" size={18} /><span><strong>Quick reminder</strong> Some devices need a specific reset process. Check your manufacturer’s instructions for a complete wipe.</span></div>
            </div>
          </div>
        </section>

        <section id="certificate" className="certificate-section section-wrap">
          <div className="section-heading">
            <div><div className="section-kicker">A RECORD OF YOUR GOOD CHOICE</div><h2>Make your next step<br /><em>something to keep.</em></h2></div>
            <p>A verification certificate is available for resale or donation after the backend records all five data-safety checks.</p>
          </div>
          <article className="certificate-card">
            <div className="certificate-top"><div className="certificate-brand"><span className="brand-icon"><Icon name="leaf" size={18} /></span> re<span className="wordmark-dot">.</span></div><span className="certificate-mark">SERVER-ISSUED VERIFICATION</span></div>
            <div className="certificate-body"><span className="certificate-overline">A LITTLE MORE CIRCULAR</span><h3>Thoughtful choices<br />make a difference.</h3><p>This certificate recognizes a completed device assessment and a recommended next step toward a more circular future.</p>
              <div className="certificate-data"><div><span>CERTIFICATE ID</span><strong>{certificateId || 'Not issued yet'}</strong></div><div><span>DEVICE</span><strong>{certificate?.deviceSummary ? `${certificate.deviceSummary.brand} ${certificate.deviceSummary.model}` : device.brand && device.model ? `${device.brand} ${device.model}` : '—'}</strong></div><div><span>RECOMMENDATION</span><strong>{recommendationLabel || '—'}</strong></div><div><span>ISSUED</span><strong>{certificate?.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : '—'}</strong></div></div>
              {certificateId ? <div className="certificate-qr"><QRCodeSVG value={publicVerifyUrl} size={78} level="M" includeMargin aria-label="Certificate verification QR code" /><span>SCAN TO VERIFY</span></div> : <div className="certificate-seal"><Icon name="leaf" size={25} /><span>MADE<br />THOUGHTFULLY</span></div>}
            </div>
            <div className="certificate-bottom"><span>RE · A BETTER NEXT STEP FOR YOUR TECH</span><span>{certificate?.disclaimer || 'Certificate not yet issued'}</span></div>
          </article>
          <div className="certificate-actions certificate-actions-stack">
            <div className="certificate-action-copy">
              <span><Icon name="shield" size={17} /> {certificateId ? 'Issued by the RE:LIFE backend; use the link or QR code to verify it.' : 'Requires an assessment, “Sell or donate” pathway, and all five safety checks.'}</span>
              {certificateError && <p className="app-alert" role="alert">{certificateError}</p>}
            </div>
            <div className="certificate-action-buttons">
              {!certificateId && <button className="button button-primary" type="button" onClick={issueCertificate} disabled={certificateLoading || selectedPath !== 'SELL_OR_DONATE' || checkedCount !== safetySteps.length}>{certificateLoading ? 'Issuing certificate…' : 'Issue verification certificate'}</button>}
              {certificateId && <a className="button button-outline" href={publicVerifyUrl}>Open public verification</a>}
              <button className="button button-outline" type="button" onClick={() => window.print()} disabled={!certificateId}><Icon name="print" size={17} /> Print / save as PDF</button>
            </div>
          </div>
          {certificateId && <div className="issued-qr"><QRCodeSVG value={publicVerifyUrl} size={148} level="M" includeMargin aria-label={`QR code linking to certificate ${certificateId}`} /><div><div className="section-kicker">PUBLIC VERIFICATION LINK</div><p>Scan this code or open the link to check this certificate against the backend’s public verification record.</p><a href={publicVerifyUrl}>{publicVerifyUrl}</a></div></div>}
        </section>

        <section id="verify" className="verify-section">
          <div className="verify-inner section-wrap">
            <div className="verify-copy"><div className="section-kicker">PUBLIC CERTIFICATE LOOKUP</div><h2>A little proof<br />goes a <em>long way.</em></h2><p>Enter a certificate ID or open a verification link. The lookup uses the backend’s public certificate endpoint.</p><form className="verify-form" onSubmit={verifyCertificate}><label htmlFor="verify-id">CERTIFICATE ID</label><div className="verify-input-row"><input id="verify-id" value={verifyId} onChange={(event) => { setVerifyId(event.target.value); setVerificationStatus('idle'); setVerifiedCertificate(null); setVerificationError('') }} placeholder={certificateId || 'e.g. RL-2026-00091'} /><button className="button button-primary" type="submit" disabled={verificationStatus === 'loading'}>{verificationStatus === 'loading' ? 'Checking…' : 'Check ID'} {verificationStatus !== 'loading' && <Icon name="arrow" size={16} />}</button></div>{verificationStatus === 'error' && <p className="verify-feedback" role="alert">{verificationError}</p>}{verificationStatus === 'success' && verifiedCertificate && <article className="verification-card" role="status"><strong>Certificate verified</strong><span>{verifiedCertificate.deviceSummary?.brand} {verifiedCertificate.deviceSummary?.model} · {verifiedCertificate.deviceSummary?.purchaseYear}</span><span>Status: {verifiedCertificate.status}</span><small>{verifiedCertificate.disclaimer}</small></article>}</form><span className="prototype-label"><span /> VERIFIED AGAINST THE LIVE API</span></div>
            <div className="qr-card">{certificateId ? <QRCodeSVG value={publicVerifyUrl} size={158} level="M" includeMargin aria-label={`QR code linking to certificate ${certificateId}`} /> : <span className="qr-empty"><Icon name="shield" size={30} /></span>}<span className="qr-caption">{certificateId ? 'SCANNABLE VERIFICATION QR' : 'CERTIFICATE QR'}</span><small>{certificateId ? 'Opens the public certificate lookup.' : 'Issue a certificate to create its QR code.'}</small></div>
          </div>
        </section>
      </main>

      <footer className="footer"><button className="wordmark footer-brand" onClick={() => goTo('home')}><span className="brand-icon"><Icon name="leaf" size={19} /></span><span>re<span className="wordmark-dot">.</span></span></button><span>Better tech, less waste. One thoughtful step at a time.</span><button className="footer-top" onClick={() => goTo('home')}>BACK TO TOP ↑</button><span className="footer-copy">© RE 2026 · HACKATHON PROTOTYPE</span></footer>

      <div className="help-widget">
        {helpOpen && <section className="help-panel" role="dialog" aria-modal="false" aria-labelledby="help-title">
          <header className="help-header">
            <span className="help-avatar"><Icon name="leaf" size={18} /></span>
            <span className="help-heading"><strong id="help-title">RE Help</strong><small>In-app demo guide · no AI endpoint</small></span>
            <button className="help-close" type="button" onClick={() => setHelpOpen(false)} aria-label="Close RE Help"><Icon name="close" size={19} /></button>
          </header>
          <div className="help-messages" ref={helpMessagesRef} role="log" aria-live="polite" aria-relevant="additions text">
            {helpMessages.map((message) => <div className={`help-message help-message-${message.sender}`} key={message.id}>
              <p>{message.text}</p>
              {message.action && <button type="button" className="help-action" onClick={() => goTo(message.action)}>{message.actionLabel}<Icon name="arrow" size={14} /></button>}
            </div>)}
            <div className="help-quick-replies" aria-label="Suggested questions">
              {quickReplies.map((reply) => <button key={reply} type="button" onClick={() => askHelp(reply)}>{reply}</button>)}
            </div>
          </div>
          <form className="help-composer" onSubmit={submitHelp}>
            <label className="visually-hidden" htmlFor="help-message-input">Ask RE Help a question</label>
            <input id="help-message-input" ref={helpInputRef} type="text" value={helpInput} onChange={(event) => setHelpInput(event.target.value)} placeholder="Ask me anything…" autoComplete="off" />
            <button className="help-send" type="submit" disabled={!helpInput.trim()} aria-label="Send message"><Icon name="send" size={17} /></button>
          </form>
        </section>}
        <button className={`help-launcher ${helpOpen ? 'help-launcher-open' : ''}`} type="button" onClick={() => setHelpOpen((open) => !open)} aria-label={helpOpen ? 'Close RE Help chat' : 'Open RE Help chat'} aria-expanded={helpOpen}>
          <Icon name={helpOpen ? 'close' : 'chat'} size={23} />
          {!helpOpen && <span className="help-launcher-label">RE Help</span>}
        </button>
      </div>
    </div>
  )
}

export default App
