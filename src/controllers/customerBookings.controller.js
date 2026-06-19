import {
createBookingService,
getMyBookingsService
} from "../services/customerBookings.service.js";

export const createBooking =
async (req,res) => {

try {

const data =
  await createBookingService(
    req.body
  );

res.json({
  success:true,
  data
});

} catch(err){

res.status(500).json({
  success:false,
  message:err.message
});

}
};

export const getMyBookings =
async (req,res) => {

try {

const data =
  await getMyBookingsService(
    req.params.userId
  );

res.json({
  success:true,
  data
});

} catch(err){

res.status(500).json({
  success:false,
  message:err.message
});

}
};