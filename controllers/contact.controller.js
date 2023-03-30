import Contact from "../models/contact.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import mailHelper from "../utils/mailHelper.js";
import config from "../config/index.js";

/***********************************************************
 * @contact
 * @Method POST
 * @Route http://localhost:4000/api/contact
 * @description contact with admin/owner
 * @parameter name, email, message
 * @returns success message, contact
 ***********************************************************/
export const contactController = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!(name && email && message)) {
    throw new CustomError("All fields are required", 400);
  }

  const contact = await Contact.create({
    name: name,
    email: email,
    message: message,
  });
  if (contact) {
    res.status(200).json({
      success: true,
      message: "submission succesfully sent",
    });
    // send Contact Form Submission Email
    await mailHelper({
      email: config.CONTACT_EMAIL,
      subject: "New contact form submission",
      html: ` <html>
            <body>
              <div>
                <h3>You have a new contact form submission!</h3>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Message:</strong> ${message}</p>
              </div>
            </body>
          </html>`,
    });
    // send Contact Form Confirmation Email
    await mailHelper({
      email: email,
      subject: "Thank you for contacting us!",
      html: `<html>
            <body>
              <div>
                <p>Dear ${name},</p>
                <p>
                  Thank you for contacting us through our website's contact form.
                  We have received your submission and we appreciate the time you
                  took to get in touch with us.
                </p>
                <p>
                  Our team is working on reviewing your message and we will get
                  back to you as soon as possible. We understand that your time is
                  valuable and we aim to provide you with a prompt response.
                </p>
                <p>
                  In the meantime, if you have any urgent matters, please feel
                  free to contact us via phone or email. Our contact details can
                  be found on our website.
                </p>
                <p>
                  Thank you again for reaching out to us. We look forward to
                  assisting you in any way we can.
                </p>
                <p>Best regards</p>
                <p>igniteshark</p>
              </div>
            </body>
          </html>`,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "submission failed server error",
    });
  }
});

