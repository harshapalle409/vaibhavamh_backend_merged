
import { supabase } from "../config/supabase.js";

export const saveVendorProfileService =
  async (userId, payload) => {
    const {
      businessName,
      ownerName,
      contactEmail,
      contactPhone,
      primaryCategory,
      subcategoryId,
    } = payload;
    const sanitizedBusinessName =
  businessName?.trim();

const sanitizedOwnerName =
  ownerName?.trim() || null;

const sanitizedEmail =
  contactEmail
    ?.trim()
    ?.toLowerCase();

const sanitizedPhone =
  contactPhone?.trim();

const sanitizedCategory =
  primaryCategory
    ?.trim()
    ?.toLowerCase();

    // 1. Get vendor profile
    const {
      data: vendorProfile,
      error: vendorError,
    } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (
      vendorError ||
      !vendorProfile
    ) {
      throw new Error(
        "Vendor profile not found"
      );
    }

    const vendorId =
      vendorProfile.id;

    // 2. Update vendor profile
    const {
      error:
        profileUpdateError,
    } = await supabase
      .from("vendor_profiles")
      .update({
        business_name:
  sanitizedBusinessName,

owner_name:
  sanitizedOwnerName,

contact_email:
  sanitizedEmail,

contact_phone:
  sanitizedPhone,

primary_category:
  sanitizedCategory,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        vendorId
      );

    if (
      profileUpdateError
    ) {
      throw new Error(
        profileUpdateError.message
      );
    }

    // 3. Get category
const normalizedCategory =
  sanitizedCategory
        ?.trim()
        ?.toLowerCase();

    const {
      data: categories,
      error: categoryError,
    } = await supabase
      .from("categories")
      .select(
        "id, name"
      );

    if (
      categoryError
    ) {
      throw new Error(
        categoryError.message
      );
    }

    const category =
      categories.find(
        (item) =>
          item.name
            ?.trim()
            ?.toLowerCase() ===
          normalizedCategory
      );

    if (
      !category
    ) {
      throw new Error(
        "Invalid category selected"
      );
    }

    // 4. Upsert vendor category
   // 4. Create / reuse vendor category

let vendorCategoryId =
  null;

// check existing
const {
  data:
    existingVendorCategory,
} = await supabase
  .from(
    "vendor_categories"
  )
  .select("id")
  .eq(
    "vendor_id",
    vendorId
  )
  .eq(
    "category_id",
    category.id
  )
  .maybeSingle();

if (
  existingVendorCategory
) {

  vendorCategoryId =
    existingVendorCategory.id;

} else {

  const {
    data:
      vendorCategory,
    error:
      vendorCategoryError,
  } = await supabase
    .from(
      "vendor_categories"
    )
    .insert({
      vendor_id:
        vendorId,

      category_id:
        category.id,
    })
    .select("id")
    .single();

  if (
    vendorCategoryError
  ) {
    throw new Error(
      vendorCategoryError.message
    );
  }

  vendorCategoryId =
    vendorCategory.id;
}

  
// 6. Initialize / Reuse venue
let venueId = null;

if (
sanitizedCategory ===
"venues"
) {

  /* ===============================
     CHECK EXISTING VENUE
  =============================== */

  const {
    data: existingVenue,
    error:
      existingVenueError,
  } = await supabase
    .from("venues")
    .select("id")
    .eq(
      "vendor_category_id",
      vendorCategoryId
    )
    .maybeSingle();

  if (
    existingVenueError
  ) {
    throw new Error(
      existingVenueError.message
    );
  }

  /* ===============================
     REUSE EXISTING VENUE
  =============================== */

  if (
    existingVenue
  ) {

    venueId =
      existingVenue.id;

  }

  /* ===============================
     CREATE NEW VENUE
  =============================== */

  else {

    const {
      data: venue,
      error:
        venueError,
    } = await supabase
      .from("venues")
      .insert({
        vendor_category_id:
          vendorCategoryId,

        name:
          businessName?.trim(),
      })
      .select("id")
      .single();

    if (
      venueError
    ) {
      throw new Error(
        venueError.message
      );
    }

    venueId =
      venue.id;
  }
}

    return {
      vendorId,
      vendorCategoryId,
      venueId,
    };
  };
export const updateVenueService =
  async (
    payload
  ) => {
    const {
      vendorId,
      venueId,

      description,
      address,

      country,
      state,
      city,
      area,
      pincode,

      capacity,
      spaceSqft,
      basePrice,
    } =
      payload;
      const sanitizedDescription =
  description?.trim() || null;

const sanitizedAddress =
  address?.trim() || null;

const sanitizedCountry =
  country?.trim() || "India";

const sanitizedState =
  state?.trim();

const sanitizedCity =
  city?.trim();

const sanitizedArea =
  area?.trim();

const sanitizedPincode =
  pincode?.trim() || null;

    // Get venue category
    const {
      data:
        vendorCategory,
      error:
        vendorCategoryError,
    } =
      await supabase
        .from(
          "vendor_categories"
        )
        .select(
          "id"
        )
        .eq(
          "vendor_id",
          vendorId
        )
        .single();

    if (
      vendorCategoryError ||
      !vendorCategory
    ) {
      throw new Error(
        "Vendor category not found"
      );
    }

    // Create location
    const {
      data: location,
      error:
        locationError,
    } =
      await supabase
        .from(
          "vendor_service_locations"
        )
        .insert({
         country:
  sanitizedCountry,

state:
  sanitizedState,

city:
  sanitizedCity,

area:
  sanitizedArea,

pincode:
  sanitizedPincode,

          vendor_category_id:
            vendorCategory.id,
        })
        .select(
          "id"
        )
        .single();

    if (
      locationError
    ) {
      throw new Error(
        locationError.message
      );
    }

    // Update profile FK
    const {
      error:
        profileError,
    } =
      await supabase
        .from(
          "vendor_profiles"
        )
        .update({
          vendor_service_location_id:
            location.id,
        })
        .eq(
          "id",
          vendorId
        );

    if (
      profileError
    ) {
      throw new Error(
        profileError.message
      );
    }

    // Update venue
    const {
      error:
        venueError,
    } =
      await supabase
        .from(
          "venues"
        )
        .update({
         description:
  sanitizedDescription,

address:
  sanitizedAddress,
          capacity:
            Number(
              capacity
            ),

          space_sqft:
            Number(
              spaceSqft
            ),

          base_price:
            Number(
              basePrice
            ),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          venueId
        );

    if (
      venueError
    ) {
      throw new Error(
        venueError.message
      );
    }

    return {
      locationId:
        location.id,
    };
  };
export const savePricingService =
  async (
    payload
  ) => {
    const {
      venueId,
      weekdayPrice,
      weekendPrice,
    } =
      payload;

    const {
      data: existingPricing,
      error: selectError,
    } =
      await supabase
        .from(
          "venue_pricing"
        )
        .select("id")
        .eq(
          "venue_id",
          venueId
        )
        .maybeSingle();

    if (
      selectError
    ) {
      throw new Error(
        selectError.message
      );
    }

    if (existingPricing) {
      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "venue_pricing"
          )
          .update({
            weekday_price:
              Number(
                weekdayPrice
              ),

            weekend_price:
              Number(
                weekendPrice
              ),

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "venue_id",
            venueId
          );

      if (
        updateError
      ) {
        throw new Error(
          updateError.message
        );
      }
    } else {
      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            "venue_pricing"
          )
          .insert({
            venue_id:
              venueId,

            weekday_price:
              Number(
                weekdayPrice
              ),

            weekend_price:
              Number(
                weekendPrice
              ),

            updated_at:
              new Date().toISOString(),
          });

      if (
        insertError
      ) {
        throw new Error(
          insertError.message
        );
      }
    }

    return {
      venueId,
    };
  };
export const saveAmenitiesService =
  async (
    payload
  ) => {
    const {
      venueId,
      amenities,
      rules,
      additionalServices,
    } =
      payload;

    // Delete old amenities
    await supabase
      .from(
        "venue_amenities"
      )
      .delete()
      .eq(
        "venue_id",
        venueId
      );

    // Insert amenities
    if (
      amenities?.length
    ) {
      const amenityRows =
        amenities.map(
          (
            amenityId
          ) => ({
            venue_id:
              venueId,

            amenity_id:
              amenityId,
          })
        );

      const {
        error:
          amenityError,
      } =
        await supabase
          .from(
            "venue_amenities"
          )
          .insert(
            amenityRows
          );

      if (
        amenityError
      ) {
        throw new Error(
          amenityError.message
        );
      }
    }

    // Rules (single row)
    await supabase
      .from(
        "venue_rules"
      )
      .delete()
      .eq(
        "venue_id",
        venueId
      );

    if (
      rules?.length
    ) {
      const {
        error:
          rulesError,
      } =
        await supabase
          .from(
            "venue_rules"
          )
          .insert({
            venue_id:
              venueId,

            rule:
              rules,
          });

      if (
        rulesError
      ) {
        throw new Error(
          rulesError.message
        );
      }
    }

    // Additional services
    await supabase
      .from(
        "venue_additional_services"
      )
      .delete()
      .eq(
        "venue_id",
        venueId
      );

    if (
      additionalServices?.length
    ) {
      const rows =
        additionalServices.map(
          (
            service
          ) => ({
            venue_id:
              venueId,

            additional_services:
              service,
          })
        );

      const {
        error:
          additionalError,
      } =
        await supabase
          .from(
            "venue_additional_services"
          )
          .insert(
            rows
          );

      if (
        additionalError
      ) {
        throw new Error(
          additionalError.message
        );
      }
    }

    return {
      venueId,
    };
  };

export const uploadPortfolioService =
  async (
    req
  ) => {

    const {
      venueId,
      serviceId,
      category,
      primaryIndex,
    } =
      req.body;

    const files =
      req.files;

    const normalizedCategory =
      String(category || "").toLowerCase();

    const entityId =
      serviceId || venueId;

    if (
      !entityId
    ) {
      throw new Error(
        "Service ID is required"
      );
    }

    const isCatering =
      normalizedCategory === "catering";

    const isDecoration =
      normalizedCategory === "decoration";

    const isPhotography =
      normalizedCategory === "photography";

    if (
      !isCatering &&
      !isDecoration &&
      !isPhotography &&
      normalizedCategory !== "venues"
    ) {
      throw new Error(
        `Unsupported upload category: ${category}`
      );
    }

    const uploadedRows =
      [];

    for (
      let i = 0;
      i < files.length;
      i++
    ) {

      const file =
        files[i];

      const fileExt =
        file.originalname
          .split(".")
          .pop();

      const fileName =
        `${entityId}/${Date.now()}-${i}.${fileExt}`;

      /* ==========================================
         UPLOAD TO SUPABASE STORAGE (with bucket fallbacks)
      ========================================== */

      const bucketCandidates = isCatering
        ? [
            "catering-images",
            "catering_images",
            "catering images",
          ]
        : isDecoration
        ? [
            "decoration-images",
            "decoration_images",
            "decoration images",
          ]
        : isPhotography
        ? [
            "photography-images",
            "photography_images",
            "photography images",
          ]
        : [
            "venue-images",
            "venue_images",
            "venue images",
          ];

      let lastUploadError = null;
      let usedBucket = null;

      for (const bucket of bucketCandidates) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!uploadError) {
          usedBucket = bucket;
          break;
        }

        lastUploadError = uploadError;

        // If error indicates bucket not found, try next candidate
        const msg = String(uploadError.message || "").toLowerCase();
        if (!msg.includes("not found") && !msg.includes("bucket")) {
          // Non-bucket error — stop trying
          break;
        }
      }

      if (!usedBucket) {
        throw new Error(lastUploadError ? lastUploadError.message : "Upload failed (no bucket available)");
      }

      /* ==========================================
         GET PUBLIC URL
      ========================================== */

      const { data: publicUrlData } = supabase.storage
        .from(usedBucket)
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      uploadedRows.push(
        {
          [
            isCatering
              ? "catering_service_id"
              : isDecoration
              ? "decoration_id"
              : isPhotography
              ? "photography_id"
              : "venue_id"
          ]: entityId,

          image_url:
            imageUrl,

          is_primary:
            Number(
              primaryIndex
            ) === i,
        }
      );
    }

    /* ==========================================
       INSERT INTO image table
    ========================================== */

    const tableName =
      isCatering
        ? "catering_images"
        : isDecoration
        ? "decoration_images"
        : isPhotography
        ? "photography_images"
        : "venue_images";

    const {
      error:
        dbError,
    } =
      await supabase
        .from(
          tableName
        )
        .insert(
          uploadedRows
        );

    if (
      dbError
    ) {
      throw new Error(
        dbError.message
      );
    }

    return {
      uploaded:
        uploadedRows.length,
    };
  };
export const completeVendorProfileService =
  async (
    payload
  ) => {

    const {
      vendorId,
    } =
      payload;

    if (
      !vendorId
    ) {
      throw new Error(
        "Vendor ID is required"
      );
    }

    const {
      error,
    } =
      await supabase
        .from(
          "vendor_profiles"
        )
        .update({
          is_profile_completed:
            true,

          approval_status:
            "pending",

          profile_status:
            "inactive",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          vendorId
        );

    if (
      error
    ) {
      throw new Error(
        error.message
      );
    }

    return {
      vendorId,
    };
  };
export const createCateringService = async (payload) => {
  const {
    vendor_id,
    name,
    address,
    description,
    cuisines,
    min_guests,
    max_plates,
    starting_price,
    buffet_style_available,
    box_packaging_available,
    live_counters_available,
    outdoor_catering_available,
    serving_staff_included,
    transport_service_included,
    custom_details,
  } = payload;

/* ==========================================
   GET CATERING CATEGORY
========================================== */

const {
  data: cateringCategory,
  error: cateringCategoryError,
} = await supabase
  .from("categories")
  .select("id")
  .ilike("name", "catering")
  .single();

if (
  cateringCategoryError
) {
  throw new Error(
    cateringCategoryError.message
  );
}

/* ==========================================
   GET VENDOR CATERING CATEGORY
========================================== */

const {
  data: vendorCategory,
  error: categoryError,
} = await supabase
  .from("vendor_categories")
  .select("id")
  .eq(
    "vendor_id",
    vendor_id
  )
  .eq(
    "category_id",
    cateringCategory.id
  )
  .maybeSingle();

if (
  categoryError
) {
  throw new Error(
    categoryError.message
  );
}

if (
  !vendorCategory
) {
  throw new Error(
    "Vendor catering category not found"
  );
}

  // 2. Prevent Duplicate Catering Creation
  const { data: existingService, error: existingError } = await supabase
    .from("catering_services")
    .select("id")
    .eq("vendor_category_id", vendorCategory.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingService) {
    return { serviceId: existingService.id };
  }

  // 3. Create Catering Service
  const { data: catering, error: cateringError } = await supabase
    .from("catering_services")
    .insert({
      vendor_category_id: vendorCategory.id,
        name,
      address,
      description,
      cuisines,
      min_guests,
      max_plates,
      starting_price,
      buffet_style_available,
      box_packaging_available,
      live_counters_available,
      outdoor_catering_available,
      serving_staff_included,
      transport_service_included,
      custom_details: custom_details || {},
    })
    .select("id")
    .single();

  if (cateringError) {
    throw new Error(cateringError.message);
  }

  // 4. Return serviceId
  return { serviceId: catering.id };
};

export const createDecorationService = async (payload) => {
  const {
    vendor_id,
    name,
    starting_price,
    description,
    custom_details,
  } = payload;

  const {
    data: decorationCategory,
    error: decorationCategoryError,
  } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "decoration")
    .single();

  if (decorationCategoryError || !decorationCategory) {
    throw new Error(
      decorationCategoryError?.message ||
        "Decoration category not found"
    );
  }

  const {
    data: vendorCategory,
    error: categoryError,
  } = await supabase
    .from("vendor_categories")
    .select("id")
    .eq("vendor_id", vendor_id)
    .eq("category_id", decorationCategory.id)
    .maybeSingle();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!vendorCategory) {
    throw new Error("Vendor decoration category not found");
  }

  const {
    data: existingService,
    error: existingError,
  } = await supabase
    .from("decoration_services")
    .select("id")
    .eq("vendor_category_id", vendorCategory.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingService) {
    return { serviceId: existingService.id };
  }

  const insertPayload = {
    vendor_category_id: vendorCategory.id,
    name,
    description,
  };

  if (starting_price !== undefined) {
    insertPayload.base_price = Number(starting_price);
  }

  const {
    data: decoration,
    error: decorationError,
  } = await supabase
    .from("decoration_services")
    .insert(insertPayload)
    .select("id")
    .single();

  if (decorationError) {
    throw new Error(decorationError.message);
  }

  return { serviceId: decoration.id };
};

export const createPhotographyService = async (payload) => {
  const {
    vendor_id,
    name,
    address,
    description,
    base_price,
  } = payload;

  const {
    data: photographyCategory,
    error: photographyCategoryError,
  } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "photography")
    .single();

  if (
    photographyCategoryError ||
    !photographyCategory
  ) {
    throw new Error(
      photographyCategoryError?.message ||
      "Photography category not found"
    );
  }

  const {
    data: vendorCategory,
    error: categoryError,
  } = await supabase
    .from("vendor_categories")
    .select("id")
    .eq("vendor_id", vendor_id)
    .eq(
      "category_id",
      photographyCategory.id
    )
    .maybeSingle();

  if (categoryError) {
    throw new Error(
      categoryError.message
    );
  }

  if (!vendorCategory) {
    throw new Error(
      "Vendor photography category not found"
    );
  }

  const {
    data: existingService,
    error: existingError,
  } = await supabase
    .from("photography")
    .select("id")
    .eq(
      "vendor_category_id",
      vendorCategory.id
    )
    .maybeSingle();

  if (existingError) {
    throw new Error(
      existingError.message
    );
  }

  if (existingService) {
    return {
      serviceId:
        existingService.id,
    };
  }

  const {
    data: photography,
    error,
  } = await supabase
    .from("photography")
    .insert({
      vendor_category_id:
        vendorCategory.id,

      name,
      address,
      description,

      base_price:
        Number(base_price) || 0,

      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    serviceId:
      photography.id,
  };
};

export const getDecorationReviewService = async (
  payload
) => {
  const { vendorId } = payload;

  const {
    data: decorationCategory,
    error: decorationCategoryError,
  } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "decoration")
    .single();

  if (decorationCategoryError || !decorationCategory) {
    throw new Error(
      decorationCategoryError?.message ||
        "Decoration category not found"
    );
  }

  const {
    data: vendorCategory,
    error: categoryError,
  } = await supabase
    .from("vendor_categories")
    .select("id")
    .eq("vendor_id", vendorId)
    .eq(
      "category_id",
      decorationCategory.id
    )
    .maybeSingle();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!vendorCategory) {
    return {
      items: [],
      addons: [],
    };
  }

  const {
    data: decorationService,
    error: decorationServiceError,
  } = await supabase
    .from("decoration_services")
    .select("id")
    .eq(
      "vendor_category_id",
      vendorCategory.id
    )
    .maybeSingle();

  if (decorationServiceError) {
    throw new Error(decorationServiceError.message);
  }

  if (!decorationService) {
    return {
      items: [],
      addons: [],
    };
  }

  const {
    data: items,
    error: itemsError,
  } = await supabase
    .from("decoration_items")
    .select(
      "id, item_name, item_price_per_unit, max_units, display_order"
    )
    .eq(
      "decoration_id",
      decorationService.id
    )
    .order("display_order", {
      ascending: true,
    });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  let entries = [];

  const {
    data,
    error: entriesError,
  } = await supabase
    .from("decoration_entries")
    .select(
      "entry_name, price, price_unit, display_order"
    )
    .eq("decoration_id", decorationService.id)
    .order("display_order", {
      ascending: true,
    });

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  entries = data || [];

  // Decoration addons table is not used — return empty addons array
  const addons = []; 

  const groupedItems = (
    items || []
  ).map((item) => ({
    itemName:
      item.item_name,
    itemPricePerUnit:
      item.item_price_per_unit,
    itemMaxUnits:
      item.max_units,
    entries: [],
  }));

  return {
    items: groupedItems,
    entries: entries.map((entry) => ({
      entryName: entry.entry_name,
      price: entry.price,
      price_unit: entry.price_unit,
    })),
    addons: addons || [],
  };
};
