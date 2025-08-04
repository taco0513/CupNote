/**
 * iOS 네이티브 OCR 브리지
 * iOS 앱에서만 작동하는 네이티브 OCR 인터페이스
 */

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        iosOCR?: {
          postMessage: (message: any) => void
        }
      }
    }
  }
}

export class IOSOCRBridge {
  /**
   * iOS 네이티브 OCR 사용 가능 여부 확인
   */
  static isAvailable(): boolean {
    return !!(
      window.webkit?.messageHandlers?.iosOCR &&
      /iPhone|iPad|iPod/.test(navigator.userAgent)
    )
  }

  /**
   * iOS 네이티브 OCR 실행
   */
  static requestOCR(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('iOS OCR is not available'))
        return
      }

      // OCR 결과를 받을 콜백 등록
      window.addEventListener('message', function handleOCRResult(event) {
        if (event.data?.type === 'IOS_OCR_RESULT') {
          window.removeEventListener('message', handleOCRResult)
          resolve(event.data)
        }
      })

      // iOS 네이티브로 OCR 요청
      window.webkit!.messageHandlers!.iosOCR!.postMessage({
        action: 'requestOCR'
      })
    })
  }
}

// iOS 앱 내에서 실행 중인지 확인
export function isIOSApp(): boolean {
  const userAgent = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(userAgent)
  const isWKWebView = !userAgent.includes('Safari') || userAgent.includes('CupNote-iOS')
  
  return isIOS && isWKWebView && IOSOCRBridge.isAvailable()
}