export interface ChatRoom {
    id: string
    item_id: string
    buyer_id: string
    seller_id: string
    created_at: string
  }
  
  export interface Message {
    id: string
    chat_id: string
    sender_id: string
    content: string
    created_at: string
  }
  