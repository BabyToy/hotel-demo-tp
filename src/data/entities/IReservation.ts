export interface IReservation {
  hotel: string;
  guest: string;
  fromDate: Date;
  toDate: Date;
  checkedIn?: Date;
  cancelled?: Date;
  created: Date;
}