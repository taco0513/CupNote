import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../stores/tastingSession'

export function useFlowNavigation() {
  const router = useRouter()
  const tastingSessionStore = useTastingSessionStore()

  /**
   * Get the appropriate back route based on current mode and view
   */
  const getBackRoute = (currentRouteName: string, mode: string) => {
    const routeMap: Record<string, Record<string, string>> = {
      'home-cafe': {
        'cafe': '/coffee-info',
        'homecafe': '/coffee-info', 
        'pro': '/coffee-info'
      },
      'pro-brewing': {
        'pro': '/home-cafe'
      },
      'qc-measurement': {
        'pro': '/pro-brewing'
      },
      'pro-qc-report': {
        'pro': '/qc-measurement'
      },
      'flavor-selection': {
        'cafe': '/coffee-info',
        'homecafe': '/home-cafe',
        'pro': '/pro-qc-report'
      },
      'sensory-expression': {
        'cafe': '/flavor-selection',
        'homecafe': '/flavor-selection',
        'pro': '/flavor-selection'
      },
      'sensory-slider': {
        'pro': '/sensory-expression'
      },
      'personal-comment': {
        'cafe': '/sensory-expression',
        'homecafe': '/sensory-expression',
        'pro': '/sensory-slider'
      },
      'roaster-notes': {
        'cafe': '/personal-comment',
        'homecafe': '/personal-comment',
        'pro': '/personal-comment'
      },
      'result': {
        'cafe': '/roaster-notes',
        'homecafe': '/roaster-notes',
        'pro': '/roaster-notes'
      }
    }

    return routeMap[currentRouteName]?.[mode] || '/mode-selection'
  }

  /**
   * Get the next route based on current mode and view
   */
  const getNextRoute = (currentRouteName: string, mode: string) => {
    const routeMap: Record<string, Record<string, string>> = {
      'mode-selection': {
        'cafe': '/coffee-info',
        'homecafe': '/coffee-info',
        'pro': '/coffee-info'
      },
      'coffee-info': {
        'cafe': '/flavor-selection',
        'homecafe': '/home-cafe',
        'pro': '/home-cafe'
      },
      'home-cafe': {
        'homecafe': '/flavor-selection',
        'pro': '/pro-brewing'
      },
      'pro-brewing': {
        'pro': '/qc-measurement'
      },
      'qc-measurement': {
        'pro': '/pro-qc-report'
      },
      'pro-qc-report': {
        'pro': '/flavor-selection'
      },
      'flavor-selection': {
        'cafe': '/sensory-expression',
        'homecafe': '/sensory-expression',
        'pro': '/sensory-expression'
      },
      'sensory-expression': {
        'cafe': '/personal-comment',
        'homecafe': '/personal-comment',
        'pro': '/sensory-slider'
      },
      'sensory-slider': {
        'pro': '/personal-comment'
      },
      'personal-comment': {
        'cafe': '/roaster-notes',
        'homecafe': '/roaster-notes',
        'pro': '/roaster-notes'
      },
      'roaster-notes': {
        'cafe': '/result',
        'homecafe': '/result',
        'pro': '/result'
      }
    }

    return routeMap[currentRouteName]?.[mode] || '/mode-selection'
  }

  /**
   * Validate current session and redirect if invalid
   */
  const validateSession = () => {
    const session = tastingSessionStore.currentSession
    
    if (!session.mode) {
      console.warn('No mode found in session, redirecting to mode selection')
      router.push('/mode-selection')
      return false
    }

    const validModes = ['cafe', 'homecafe', 'pro']
    if (!validModes.includes(session.mode)) {
      console.error('Invalid mode detected:', session.mode)
      tastingSessionStore.clearCurrentSession()
      router.push('/mode-selection')
      return false
    }

    return true
  }

  /**
   * Validate required data for current step
   */
  const validateStepData = (requiredFields: string[]) => {
    const session = tastingSessionStore.currentSession
    
    for (const field of requiredFields) {
      const fieldValue = session[field as keyof typeof session]
      if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        console.warn(`Missing required field: ${field}`)
        return false
      }
    }
    
    return true
  }

  /**
   * Navigate to next step with validation
   */
  const navigateNext = (currentRouteName: string, requiredFields: string[] = []) => {
    if (!validateSession()) return
    
    if (!validateStepData(requiredFields)) {
      console.warn('Required data missing, cannot proceed')
      return
    }

    const mode = tastingSessionStore.currentSession.mode!
    const nextRoute = getNextRoute(currentRouteName, mode)
    
    console.log(`Navigating from ${currentRouteName} to ${nextRoute} (mode: ${mode})`)
    router.push(nextRoute)
  }

  /**
   * Navigate to previous step
   */
  const navigateBack = (currentRouteName: string) => {
    if (!validateSession()) return

    const mode = tastingSessionStore.currentSession.mode!
    const backRoute = getBackRoute(currentRouteName, mode)
    
    console.log(`Navigating back from ${currentRouteName} to ${backRoute} (mode: ${mode})`)
    router.push(backRoute)
  }

  return {
    getBackRoute,
    getNextRoute,
    validateSession,
    validateStepData,
    navigateNext,
    navigateBack
  }
}