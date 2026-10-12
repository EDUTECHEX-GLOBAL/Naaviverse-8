import React from "react";
import SuperAdminCustomPathBuilder from "./SuperAdminCustomPathBuilder";

export {
  CATEGORIES,
  VIEWS,
  GRADE_LIST,
  GRADE_AVG_LIST,
  CURRICULUM_LIST,
  STREAM_LIST,
  FINANCE_LIST,
  PERSONALITY_LIST,
  PATH_TYPES,
  PATH_CATS,
} from "./SuperAdminCustomPathBuilder";

export default function SuperAdminCreatePathModal({
  isOpen = true,
  onClose,
  request,
  onPathCreated,
}) {
  if (isOpen === false || !request) return null;

  return (
    <SuperAdminCustomPathBuilder
      request={request}
      onBack={onClose}
      onPathCreated={onPathCreated}
    />
  );
}
