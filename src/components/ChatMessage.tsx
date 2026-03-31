import type { Message } from '../types'

type Props = {
  message: Message
}

const ChatMessage = ({ message }: Props) => {
  const isUser = message.sender === 'user'
  const time = new Date(message.date).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`rounded-lg p-3 max-w-xs ${
        isUser
          ? 'self-end bg-blue-500 text-white'
          : 'self-start bg-gray-200 text-gray-800'
      }`}
    >
      <p>{message.message}</p>
      <p
        className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}
      >
        {time}
      </p>
    </div>
  )
}

export default ChatMessage
