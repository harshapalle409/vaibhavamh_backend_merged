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
  success: true,
  data
});

} catch(err) {

  // 409 = duplicate booking — surface it with the right HTTP status
  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message
  });

}
};

export const getMyBookings =
async (req,res) => {

try {

const userId = req.query.userId || req.params.userId;

if (!userId) {
  return res.status(400).json({
    success: false,
    message: "userId is required"
  });
}

const data =
  await getMyBookingsService(userId);

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