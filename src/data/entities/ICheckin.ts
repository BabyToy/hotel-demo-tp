export interface ICheckin {
  bookingId?: string;
  hotelId: string;
  guestId: string;
  room: number;
  checkIn: Date;
  checkOut?: Date;
}
