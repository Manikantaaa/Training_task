import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "../styles/CompanyBanners.css";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const maxSize = 5 * 1024 * 1024;
const ItemType = "BANNER";
function BannerItem({
  banner,
  index,
  moveBanner,
  handleDelete,
  handleHideToggle
}) {
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: ItemType,
    drop: (item) => {
      if (item.index !== index) {
        moveBanner(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      className={`banner-box ${banner.isHidden ? "hidden-banner" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img src={banner.preview} alt="preview" />
      <button className="delete-btn" onClick={() => handleDelete(banner.id)}>
        ×
      </button>
      <button
        className={`toggle-btn ${banner.isHidden ? "hidden" : ""}`}
        onClick={() => handleHideToggle(banner.id)}
        title={banner.isHidden ? "Show" : "Hide"}
      >
        {banner.isHidden ? "👁" : "🚫"}
      </button>
    </div>
  );
}

export default function CompanyBanners() {
  const [banners, setBanners] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/allbanners`).then((res) => {
      const existing = res.data.map((b) => ({
        id: b.id,
        file: null,
        preview: `${API_BASE_URL}/Banners/${b.filename}`,
        isHidden: b.visibility === "hidden",
        isDeleted: false,
        con: true,
      }));
      setBanners(existing);
    });
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        if (img.width === 1900 && img.height === 180) {
          if (file.size <= maxSize) {
            setBanners((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                file,
                preview: objectUrl,
                isHidden: false,
                isDeleted: false,
              },
            ]);
            setErrorMsg("");
          } else {
            setErrorMsg(`"${file.name}" exceeds 5MB`);
          }
        } else {
          setErrorMsg(`"${file.name}" must be 1900×180 pixels`);
        }
      };
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    multiple: true,
  });

  const handleDelete = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isDeleted: true } : b))
    );
    setErrorMsg("");
  };

  const handleHideToggle = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isHidden: !b.isHidden } : b))
    );
  };

  const moveBanner = (fromIndex, toIndex) => {
    const updated = [...banners];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setBanners(updated);
  };

  const handleSave = async () => {
    const formData = new FormData();

    banners.forEach((b, index) => {
      if (!b.isDeleted) {
        if (b.file) {
          formData.append("files", b.file);
          formData.append("visibility", b.isHidden ? "hidden" : "visible");
          formData.append("order", index);
        } else if (b.con) {
          formData.append("existingIds", b.id);
          formData.append(
            "existingVisibility",
            b.isHidden ? "hidden" : "visible"
          );
          formData.append("existingOrder", index);
        }
      } else if (b.con) {
        formData.append("deletedIds", b.id);
      }
    });

    try {
      await axios.post(
        `${API_BASE_URL}/upload-multiple-banners`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Banners updated successfully!");
      navigate("/image-uploads");
    } catch (error) {
      console.error("Error uploading banners:", error);
      alert("Something went wrong while uploading.");
    }
  };

  return (
    <div className="container">
      <h2>Upload Home Page Banners</h2>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <div className="upload-icon">
          <svg
            width="28"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            <polyline points="7 9 12 4 17 9" />
            <line x1="12" y1="4" x2="12" y2="16" />
          </svg>
        </div>
        <p>
          <strong>Click or Drag & Drop</strong> to upload images
        </p>
        <p>
          JPG or PNG (MAX. 5 MB each), <strong>1900 × 180</strong> pixels
        </p>
      </div>

      {errorMsg && <div className="error-box">{errorMsg}</div>}

      <DndProvider backend={HTML5Backend}>
        <div className="banner-preview-container">
          {banners.map(
            (banner, index) =>
              !banner.isDeleted && (
                <BannerItem
                  key={banner.id}
                  index={index}
                  banner={banner}
                  moveBanner={moveBanner}
                  handleDelete={handleDelete}
                  handleHideToggle={handleHideToggle}
                />
              )
          )}
        </div>
      </DndProvider>

      <button onClick={handleSave} className="save-button">
        Save
      </button>
    </div>
  );
}
