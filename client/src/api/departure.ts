import api from './index';

export interface IDeparture {
  id: string;
  tourId: string;
  tour_id?: string;
  departureDate: string;
  departure_date?: string;
  returnDate: string | null;
  return_date?: string | null;
  originalPrice: number | null;
  original_price?: number | null;
  promoPrice: number;
  promo_price?: number;
  seatsLeft: number;
  seats_left?: number;
  status: string;
  note: string | null;
  tourTitle?: string;
  tour_title?: string;
  tourDestination?: string;
  tour_destination?: string;
  tourCoverImage?: string;
  tour_cover_image?: string;
}

function normalize(d: any): IDeparture {
  return {
    ...d,
    tourId: d.tour_id || d.tourId,
    departureDate: d.departure_date || d.departureDate,
    returnDate: d.return_date ?? d.returnDate,
    originalPrice: d.original_price ?? d.originalPrice,
    promoPrice: d.promo_price ?? d.promoPrice,
    seatsLeft: d.seats_left ?? d.seatsLeft,
    tourTitle: d.tour_title || d.tourTitle,
    tourDestination: d.tour_destination || d.tourDestination,
    tourCoverImage: d.tour_cover_image || d.tourCoverImage,
  };
}

export async function getDepartures(): Promise<IDeparture[]> {
  const r = await api.get('/api/departures');
  return r.data.data.map(normalize);
}

export async function getUpcomingDepartures(): Promise<IDeparture[]> {
  const r = await api.get('/api/departures/upcoming');
  return r.data.data.map(normalize);
}

export async function createDeparture(data: Partial<IDeparture>): Promise<IDeparture> {
  const r = await api.post('/api/departures', data);
  return normalize(r.data.data);
}

export async function updateDeparture(id: string, data: Partial<IDeparture>): Promise<IDeparture> {
  const r = await api.put('/api/departures/' + id, data);
  return normalize(r.data.data);
}

export async function deleteDeparture(id: string): Promise<void> {
  await api.delete('/api/departures/' + id);
}
