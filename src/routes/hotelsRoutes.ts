import dayjs from "dayjs";
import { NextFunction, Request, Response, Router } from "express";

import HotelModel from "../data/models/hotels";
import ReservationModel from "../data/models/reservations";

const router: Router = Router();
const hotelModel = new HotelModel();
const bookingModel = new ReservationModel();

router.get("/", async (request: Request, response: Response, next: NextFunction) => {
  const { id } = request.query;

  hotelModel
    .get(id as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.get("/all", async (request: Request, response: Response, next: NextFunction) => {
  hotelModel
    .getAll()
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.post("/add", async (request: Request, response: Response, next: NextFunction) => {
  const { name, capacity } = request.body;

  hotelModel
    .add(name as string, capacity as number)
    .then(result => {
      response.status(201).json(result.toObject());
    })
    .catch(next);
});

router.post("/update", async (request: Request, response: Response, next: NextFunction) => {
  const { id, name, capacity } = request.body;

  hotelModel
    .update(id as string, name as string, capacity as number)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.get("/room/inventory", async (request: Request, response: Response, next: NextFunction) => {
  const { hotelId, startDate, stopDate } = request.query;

  const from = dayjs(startDate as string)
    .hour(12)
    .toDate();
  const to = dayjs(stopDate as string)
    .hour(12)
    .toDate();
  hotelModel
    .inventory(hotelId as string, from, to)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.get("/book/list", async (request: Request, response: Response, next: NextFunction) => {
  const { hotel, fromDate, toDate } = request.query;

  const from = dayjs(fromDate as string)
    .hour(12)
    .toDate();
  const to = dayjs(toDate as string)
    .hour(12)
    .toDate();
  bookingModel
    .list(hotel as string, from, to)
    // .list(hotel as string, fromDate as Date, toDate as Date)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.get("/book/list/guest", async (request: Request, response: Response, next: NextFunction) => {
  const { hotel, guest } = request.query;

  bookingModel
    .listPerGuest(hotel as string, guest as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

// hotel and name are IDs
router.post("/book", async (request: Request, response: Response, next: NextFunction) => {
  const { hotel, guest, fromDate, toDate } = request.body;

  bookingModel
    .add(hotel as string, guest as string, fromDate as Date, toDate as Date)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

// hotel and name are IDs
router.post("/book/cancel", async (request: Request, response: Response, next: NextFunction) => {
  const { bookingId } = request.body;

  bookingModel
    .cancel(bookingId as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

// hotel and name are IDs
// endpoint will checkin the guest
router.post("/book/checkin", async (request: Request, response: Response, next: NextFunction) => {
  const { bookingId } = request.body;

  bookingModel
    .checkin(bookingId as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

const hotelsRoutes: Router = router;
export default hotelsRoutes;
