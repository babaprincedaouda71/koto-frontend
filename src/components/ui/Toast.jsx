import { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    const styles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-gray-800 text-white',
    }

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${styles[type]} md:bottom-6`}>
            {message}
        </div>
    )
}

export default Toast
