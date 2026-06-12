import { supabase } from "../config/supabase.js";

const BUCKET_NAME =
  "vendor-documents";

const BUCKET_CANDIDATES = [
  BUCKET_NAME,
  "vendor_documents",
  "vendor documents",
];

export const uploadVendorDocumentsService =
  async (
    vendorId,
    files
  ) => {

    const uploadedDocs =
      {};

    /* ==========================================
       UPLOAD FILES TO STORAGE
    ========================================== */

    for (const [
      key,
      file,
    ] of Object.entries(
      files
    )) {

      if (!file) {
        continue;
      }

      const extension =
        file.originalname
          .split(".")
          .pop();

      const filePath =
        `${vendorId}/${key}-${Date.now()}.${extension}`;

      let usedBucket =
        null;

      let lastUploadError =
        null;

      for (const bucket of BUCKET_CANDIDATES) {

        const {
          error:
            uploadError,
        } =
          await supabase
            .storage
            .from(bucket)
            .upload(
              filePath,
              file.buffer,
              {
                contentType:
                  file.mimetype,

                upsert:
                  true,
              }
            );

        /* ===============================
           STORAGE SUCCESS
        =============================== */

        if (
          !uploadError
        ) {

          console.log(
            `[UPLOAD SUCCESS] Bucket: ${bucket}`
          );

          usedBucket =
            bucket;

          break;
        }

        /* ===============================
           STORAGE ERROR
        =============================== */

        lastUploadError =
          uploadError;

        console.error(
          "[STORAGE_UPLOAD_ERROR]",
          uploadError
        );

        const msg =
          String(
            uploadError.message ||
              ""
          ).toLowerCase();

        if (
          !msg.includes(
            "not found"
          ) &&
          !msg.includes(
            "bucket"
          )
        ) {
          break;
        }
      }

      /* ===============================
         NO BUCKET FOUND
      =============================== */

      if (
        !usedBucket
      ) {

        console.error(
          "[NO_STORAGE_BUCKET_FOUND]",
          lastUploadError
        );

        throw new Error(
          lastUploadError?.message ||
            "Document upload failed: no storage bucket found"
        );
      }

      /* =====================================
         GET PUBLIC URL FOR STORED FILE
      ===================================== */
      const { data: publicUrlData, error: publicUrlError } = await supabase.storage
        .from(usedBucket)
        .getPublicUrl(filePath);

      if (publicUrlError || !publicUrlData?.publicUrl) {
        // Fall back to storing the storage path if public URL unavailable
        uploadedDocs[`${key}_url`] = filePath;
      } else {
        uploadedDocs[`${key}_url`] = publicUrlData.publicUrl;
      }
    }

    console.log(
      "[UPLOAD] FILES UPLOADED TO STORAGE"
    );

    /* ==========================================
       CHECK EXISTING DOCUMENT ROW
    ========================================== */

    const {
      data: existingRow,
      error: selectError,
    } =
      await supabase
        .from("vendor_documents")
        .select("id")
        .eq("vendor_id", vendorId)
        .single();

    console.log("[DOCUMENT_SELECT]", existingRow);
    console.log("[DOCUMENT_SELECT_ERROR]", selectError);
    console.log("[DOCUMENT_SELECT_RESULT]", existingRow);

    // Use mutable locals instead of reassigning destructured consts
    let selectErr = selectError;
    let existing = existingRow;

    // If .single() was used temporarily, it throws when zero rows are returned
    // Treat that specific case as "no existing row" so upload still proceeds.
    if (selectErr) {
      const msg = String(selectErr.message || "");
      if (msg.includes("Cannot coerce the result to a single JSON object") || msg.includes("No rows found")) {
        console.warn("[DOCUMENT_SELECT_WARNING] single() returned no rows — treating as no existing row");
        // clear error and treat as no existing row
        selectErr = null;
        existing = null;
      } else {
        console.error("[DOCUMENT_SELECT_ERROR]", selectErr);
        throw new Error(selectErr.message);
      }
    }

    /* ==========================================
       UPDATE EXISTING
    ========================================== */

    if (existing) {
      console.log("[DOCUMENT_ROW_FOUND]", existing);
      console.log("[DOCUMENTS] EXISTING ROW FOUND → UPDATE");

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "vendor_documents"
          )
          .update({
            ...uploadedDocs,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "vendor_id",
            vendorId
          );

      if (
        updateError
      ) {

        console.error(
          "[DOCUMENT_UPDATE_ERROR]",
          updateError
        );

        throw new Error(
          updateError.message
        );
      }
    }

    /* ==========================================
       INSERT NEW
    ========================================== */

    else {

      console.log(
        "[DOCUMENTS] NO ROW FOUND → INSERT"
      );

      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            "vendor_documents"
          )
          .insert({
            vendor_id:
              vendorId,

            ...uploadedDocs,

            updated_at:
              new Date()
                .toISOString(),
          });

      if (
        insertError
      ) {

        console.error(
          "[DOCUMENT_INSERT_ERROR]",
          insertError
        );

        throw new Error(
          insertError.message
        );
      }
    }

    /* ==========================================
       SUCCESS
    ========================================== */

    console.log(
      "[DOCUMENT_UPLOAD_SUCCESS]"
    );

    return {
      success:
        true,
    };
  };