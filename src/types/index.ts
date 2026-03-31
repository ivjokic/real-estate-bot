
export interface Message {
    sender: Role,
    date: Date,
    message: string

}



export type Role = "user" | "assistant"