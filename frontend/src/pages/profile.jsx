import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { updateProfile, uploadProfilePhoto } from "../api/auth"; 
import { User, Mail, Briefcase, Tag, Camera, Save, Loader, Phone, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getDefaultAvatar = (name) =>
    name ? name.trim().charAt(0).toUpperCase() : "";

export default function ProfilePage() {
    const { user, refreshUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        company: user?.company || "",
        role: user?.role || "",
        phone: user?.phone || "",
        address: user?.address || "",
        bio: user?.bio || "",
        picture: user?.picture || "",
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = React.useRef(null);

    useEffect(() => {
        setProfile({
            name: user?.name || "",
            email: user?.email || "",
            company: user?.company || "",
            role: user?.role || "",
            phone: user?.phone || "",
            address: user?.address || "",
            bio: user?.bio || "",
            picture: user?.picture || "",
        });
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const pickFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        const reader = new FileReader();

        reader.onload = async () => {
            const dataUrl = reader.result;

            setProfile((prev) => ({ ...prev, picture: dataUrl }));

            try {
                await uploadProfilePhoto({ data_url: dataUrl });
                await refreshUserProfile();
            } catch (err) {
                alert("Photo upload failed");
            } finally {
                setUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    const save = async () => {
        setSaving(true);

        try {
            const { name, company, role, phone, address, bio } = profile;

            await updateProfile({ name, company, role, phone, address, bio });
            await refreshUserProfile();
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const avatarInitial = getDefaultAvatar(profile.name || user?.email);

    return (
        <div className="page-container-app">
            <div className="container profile-page-container">

                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                    ← Back to Dashboard
                </button>

                <div className="app-panel profile-panel">
                    <h2>User Profile</h2>

                    {/* Photo Section */}
                    <div className="profile-photo-section">
                        {profile.picture ? (
                            <img src={profile.picture} className="profile-avatar-large" alt="avatar" />
                        ) : (
                            <div className="profile-avatar-default">{avatarInitial}</div>
                        )}

                        <button
                            className="photo-upload-btn"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? <Loader className="spinner" /> : <Camera />}
                            {uploading ? "Uploading..." : "Change Photo"}
                        </button>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={pickFile}
                            style={{ display: "none" }}
                        />
                    </div>

                    {/* Profile Form */}
                    <div className="profile-form">

                        <Input label="Full Name" icon={<User />} name="name" value={profile.name} onChange={handleChange} />
                        <Input label="Email" icon={<Mail />} value={profile.email} readOnly disabled />

                        <Input label="Company" icon={<Briefcase />} name="company" value={profile.company} onChange={handleChange} />
                        <Input label="Role" icon={<Tag />} name="role" value={profile.role} onChange={handleChange} />
                        <Input label="Phone" icon={<Phone />} name="phone" value={profile.phone} onChange={handleChange} />
                        <Input label="Address" icon={<MapPin />} name="address" value={profile.address} onChange={handleChange} />

                        <div className="form-group-icon">
                            <label><FileText size={16} /> Bio</label>
                            <textarea name="bio" value={profile.bio} onChange={handleChange} />
                        </div>

                    </div>

                    {/* Save button */}
                    <button className="profile-save-btn" disabled={saving} onClick={save}>
                        {saving ? <Loader className="spinner" /> : <Save />}  
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* Helper input component */
function Input({ label, icon, ...rest }) {
    return (
        <div className="form-group-icon">
            <label>{icon} {label}</label>
            <input {...rest} />
        </div>
    );
}
