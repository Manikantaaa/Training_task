import React from 'react';
import "../styles/Modal.css"
const NotificationModal = ({
  editMode,
  notifForm,
  setNotifForm,
  handleCreateNotification,
  setShowCreateForm,
  setEditMode
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
           <div className="modal-header">
            <h3>{editMode ? 'Edit Notification' : 'Create Notification'}</h3>

        <button
          className="close-btn"
          onClick={() => {
            setShowCreateForm(false);
            setEditMode(false);
            setNotifForm({ title: '', description: '', image: null });
          }}
        >
          ×
        </button>

</div>    
   <form onSubmit={handleCreateNotification}>

    <input
          type="text"
          name="title"
          placeholder="Title"
          value={notifForm.title}
          onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={notifForm.description}
          onChange={e => setNotifForm({ ...notifForm, description: e.target.value })} required
        />
        <input
          type="file"
          name="image"
          onChange={e => setNotifForm({ ...notifForm, image: e.target.files[0] })} required
        />
        <br/>
        <button>
          {editMode ? 'Update' : 'Submit'}
        </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
