import { NextFunction, Request, Response, Router } from "express";

import GuestModel from "../data/models/guests";

const router: Router = Router();
const model = new GuestModel();

router.get("/", async (request: Request, response: Response, next: NextFunction) => {
  const { id } = request.query;
  model
    .findById(id as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.get("/all", async (request: Request, response: Response, next: NextFunction) => {
  model
    .getAll()
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.post("/add", async (request: Request, response: Response, next: NextFunction) => {
  const { name } = request.body;

  model
    .add(name)
    .then(result => {
      response.status(201).json(result.toObject());
    })
    .catch(next);
});

router.post("/update", async (request: Request, response: Response, next: NextFunction) => {
  const { id, name } = request.body;
  model
    .update(id as string, name as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.post("/delete", async (request: Request, response: Response, next: NextFunction) => {
  const { id } = request.body;
  model
    .delete(id as string)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.post("/checkin", async (request: Request, response: Response, next: NextFunction) => {
  const { hotelId, guestId, toDate } = request.body;
  model
    .checkin(hotelId, guestId, toDate)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

router.post("/checkout", async (request: Request, response: Response, next: NextFunction) => {
  const { checkInId } = request.body;
  model
    .checkout(checkInId)
    .then(result => {
      response.status(201).json(result);
    })
    .catch(next);
});

const guestRoutes: Router = router;
export default guestRoutes;
