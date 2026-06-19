import { supabase }
from "../config/supabase.js";

export const createBookingService =
async (payload) => {

const {
user_id,
vendor_category_id,
booking_date,
booking_time,
to_time,
booking_details
} = payload;

const {
data: customer
} = await supabase
.from("customer_profiles")
.select("id")
.eq("user_id", user_id)
.single();

const { data, error } =
await supabase
.from("customer_bookings")
.insert({
customer_id:
customer.id,

    vendor_category_id,

    booking_date,

    booking_time:
        booking_time || null,

    to_time:
        to_time || null,

    booking_details,

    total_amount:
      booking_details.selected_price,

    status:
      "pending"
  })
  .select()
  .single();

if (error)
throw error;

return data;
};




export const getMyBookingsService =
async (userId) => {

const {
data: customer
} = await supabase
.from("customer_profiles")
.select("id")
.eq("user_id", userId)
.single();

const {
data,
error
} = await supabase
.from("customer_bookings")
.select("*")
.eq(
"customer_id",
customer.id
)
.order(
"created_at",
{
ascending: false
}
);

if(error)
throw error;

return data;
};