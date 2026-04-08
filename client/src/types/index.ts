export interface ITour {
  id: string; title: string; description?: string;
  destination: string; region: string; duration: number; price: number;
  departure: string; coverImage?: string; tags?: string[];
  status?: string; featured?: boolean; programUrl?: string; createdAt?: string; updatedAt?: string;
  itinerary?: IItineraryDay[];
}
export interface IItineraryDay {
  id?: string; day: number; title: string;
  activities: string[]; meals: string[]; accommodation?: string;
}
export interface IDestination {
  id: string; name: string; nameEn?: string; region: string; status?: string; sortOrder?: number;
}
export interface IStaff {
  id: string; username: string; name: string; role: string; status?: string; createdAt?: string;
}
export interface ChatMessage {
  id: string; sessionId: string; role: 'user'|'ai'|'staff';
  content: string; timestamp: string; staffName?: string;
}
export interface ChatSession {
  id: string; visitorName: string; status: 'ai'|'waiting'|'staffing'|'closed';
  messages: ChatMessage[]; createdAt: string; updatedAt: string; staffName?: string; staffId?: string;
}
