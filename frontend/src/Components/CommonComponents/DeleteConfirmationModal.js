import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  itemName,
  itemType = 'item', // 'story', 'scene', 'character', etc.
  warningMessage,
  additionalInfo
}) => {
  if (!isOpen) return null;

  // Default warning messages based on item type
  const getDefaultWarningMessage = () => {
    switch (itemType.toLowerCase()) {
      case 'story':
        return 'This action cannot be undone. All characters, scenes, and content associated with this story will be permanently deleted.';
      case 'scene':
        return 'This action cannot be undone. The scene and its image will be permanently deleted.';
      case 'character':
        return 'This action cannot be undone. The character and associated data will be permanently deleted.';
      default:
        return 'This action cannot be undone. This item will be permanently deleted.';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`modal fade ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        style={{ display: isOpen ? 'block' : 'none', zIndex: 1050 }}
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center gap-2">
                <WarningAmberIcon style={{ color: '#f59e0b' }} />
                <h1 className="modal-title fs-5" id="deleteModalLabel">
                  Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </h1>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
                disabled={isDeleting}
              ></button>
            </div>

            <div className="modal-body">
              <p className="text-muted mb-3">
                Are you sure you want to delete{' '}
                {itemName ? (
                  <strong>"{itemName}"</strong>
                ) : (
                  `this ${itemType}`
                )}
                ?
              </p>
              <div className="alert alert-warning">
                <small className="text-dark">
                  <strong>Warning:</strong> {warningMessage || getDefaultWarningMessage()}
                </small>
              </div>
              {additionalInfo && (
                <div className="mt-2">
                  <small className="text-muted">{additionalInfo}</small>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <DeleteOutlineIcon style={{ fontSize: '16px', marginRight: '4px' }} />
                    Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationModal;
