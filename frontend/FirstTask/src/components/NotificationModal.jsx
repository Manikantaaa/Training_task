import React, { useEffect, useRef, useState } from 'react';
import "../styles/NotificationModal.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NotificationModal = ({ onClose, notifForm, setNotifForm, editMode, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
 const titleRef = useRef(null);
  const descRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => {
    if (editMode && notifForm.image && typeof notifForm.image === 'string') {
      setImagePreview(`${API_BASE_URL}/Images/${notifForm.image}`);
    }
  }, [notifForm.image, editMode]);

const validate = () => {
  const newErrors = {};

  if (!notifForm.title.trim()) {
    newErrors.title = "Title is required.";
  }

  if (!notifForm.description.trim()) {
    newErrors.description = "Description is required.";
  }

  if (!editMode && !notifForm.image) {
    newErrors.image = "Image is required.";
  }



  setErrors(newErrors);

  if (newErrors.title) {
    titleRef.current?.focus();
  } else if (newErrors.description) {
    descRef.current?.focus();
  } else if (newErrors.image) {
    imageRef.current?.focus();
  }

  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files.length > 0) {
      const file = files[0];
      setNotifForm({ ...notifForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setNotifForm({ ...notifForm, [name]: value });
    }

    setErrors({ ...errors, [name]: null });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editMode ? "Edit Notification" : "Create Notification"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={notifForm.title}
              onChange={handleChange}
              placeholder='Enter title'
                ref={titleRef}

            />
            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={notifForm.description}
              onChange={handleChange}
              placeholder="Enter description"
                ref={descRef}

            />
            {errors.description && <p className="error errors">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label>Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
                ref={imageRef}

            />
            {errors.image && <p className="error">{errors.image}</p>}
            {imagePreview && (
              <div className="image-preview">
                <label>Selected Image:</label>
                <img src={imagePreview} alt="Preview" className="preview-img" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editMode ? "Update" : "Create"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
