'use strict';

const mongoose = require('mongoose');

/**
 * A contact-form enquiry.
 *
 * Stored before email is attempted, so a mail-transport failure never loses a
 * prospective client's message. `emailStatus` records what happened afterwards,
 * which makes it possible to find and retry the ones that did not go out.
 */
const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: [true, 'Email address is required.'],
      trim: true,
      lowercase: true,
      maxlength: 120,
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      maxlength: 24,
    },

    practiceArea: {
      type: String,
      required: [true, 'Practice area is required.'],
      trim: true,
      maxlength: 80,
      index: true,
    },

    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      maxlength: 140,
    },

    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      maxlength: 4000,
    },

    consent: {
      type: Boolean,
      required: true,
      default: false,
    },

    /** Simple workflow state for whoever triages the inbox. */
    status: {
      type: String,
      enum: ['new', 'contacted', 'consultation-booked', 'closed', 'spam'],
      default: 'new',
      index: true,
    },

    emailStatus: {
      notification: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'skipped'],
        default: 'pending',
      },
      autoReply: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'skipped'],
        default: 'pending',
      },
      error: { type: String, default: null },
    },

    /**
     * Request metadata, retained for abuse investigation.
     * Note: an IP address is personal data under most privacy regimes — keep the
     * retention period in your privacy policy aligned with the TTL below.
     */
    meta: {
      ip: { type: String, default: null },
      userAgent: { type: String, default: null },
      referer: { type: String, default: null },
      recaptchaScore: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
    /** Never leak Mongo internals if a document is ever serialised to a client. */
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.meta;
        return ret;
      },
    },
  },
);

/** Inbox view: newest first, filtered by status. */
enquirySchema.index({ createdAt: -1, status: 1 });

/** Supports the duplicate-submission check in the contact controller. */
enquirySchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
