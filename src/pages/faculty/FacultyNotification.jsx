import { useEffect, useState } from "react";
import API from "./../../api";
import { useAuth } from "../../context/AuthContext";
import { FaTrash, FaPaperPlane, FaBell, FaEdit } from "react-icons/fa";
import "./FacultyNotification.css";

function FacultyNotification() {

    const { user, loading: authLoading } = useAuth();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const [notifications, setNotifications] = useState([]);
    const [sending, setSending] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const facultyId =
        user?.facultyId ||
        localStorage.getItem("facultyId") ||
        null;

    /* ==========================================
       LOAD MY SENT NOTIFICATIONS
    ========================================== */

    useEffect(() => {
        const loadNotifications = async () => {
            if (authLoading) {
                return;
            }

            if (!user) {
                setLoading(false);
                setError("Please login to manage notifications.");
                return;
            }

            if (user.role !== "faculty") {
                setLoading(false);
                setError("Only faculty accounts can send notifications.");
                return;
            }

            if (!facultyId) {
                setLoading(false);
                setError("Faculty ID is not available for this account.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `/notifications/faculty/${encodeURIComponent(facultyId)}`
                );

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.notifications || [];

                setNotifications(data);
            } catch (err) {
                console.error("Notification loading error:", err);
                setNotifications([]);
                setError(
                    err.response?.data?.message ||
                        "Unable to load your notifications from the server."
                );
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [authLoading, user, facultyId]);

    /* ==========================================
       SEND NOTIFICATION
    ========================================== */

    const sendNotification = async () => {

        if (!title || !message) {
            alert("Please fill all fields");
            return;
        }

        try {
            setSending(true);
            setError("");

            if (editingId) {
                await API.put(
                    `/notifications/${encodeURIComponent(editingId)}`,
                    {
                        title,
                        message,
                    }
                );
            } else {
                await API.post(
                    "/notifications",
                    {
                        title,
                        message,
                    }
                );
            }

            alert(
                editingId
                    ? "Notification Updated Successfully"
                    : "Notification Sent Successfully"
            );

            cancelEdit();

            const response = await API.get(
                `/notifications/faculty/${encodeURIComponent(facultyId)}`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.notifications || [];

            setNotifications(data);
        } catch (err) {
            console.error("Notification sending error:", err);
            setError(
                err.response?.data?.message ||
                    "Error sending notification"
            );
            alert("Error sending notification");
        } finally {
            setSending(false);
        }
    };

    /* ==========================================
       START EDITING A NOTIFICATION
    ========================================== */

    const startEdit = (notif) => {
        setEditingId(notif._id || notif.id);
        setTitle(notif.title);
        setMessage(notif.message);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ==========================================
       CANCEL EDITING
    ========================================== */

    const cancelEdit = () => {
        setEditingId(null);
        setTitle("");
        setMessage("");
    };

    /* ==========================================
       DELETE MY NOTIFICATION
    ========================================== */

    const deleteNotification = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this notification?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await API.delete(`/notifications/${encodeURIComponent(id)}`);

            setNotifications(
                notifications.filter(
                    (item) => (item._id || item.id) !== id
                )
            );
        } catch (err) {
            console.error("Notification deletion error:", err);
            setError(
                err.response?.data?.message ||
                    "Unable to delete notification."
            );
            alert("Failed to delete notification");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "";
        }

        return new Date(value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (

        <div className="notification-container">

            <div className="notification-card">

                <h2>
                    {editingId
                        ? "Edit Notification"
                        : "Send Notification"}
                </h2>

                {error && (
                    <div className="notification-error">
                        {error}
                    </div>
                )}

                {editingId && (
                    <div className="notification-editing">
                        Editing a notification. The update will be
                        visible to students immediately.
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Notification Title"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                />

                <textarea
                    rows="8"
                    placeholder="Write notification here..."
                    value={message}
                    onChange={(e)=>setMessage(e.target.value)}
                />

                <button
                    onClick={sendNotification}
                    disabled={sending}
                >
                    {sending
                        ? "Saving..."
                        : (
                            <>
                                <FaPaperPlane />
                                {editingId
                                    ? "Update Notification"
                                    : "Send Notification"}
                            </>
                        )}
                </button>

                {editingId && (
                    <button
                        className="notification-cancel"
                        onClick={cancelEdit}
                        disabled={sending}
                    >
                        Cancel Edit
                    </button>
                )}

            </div>

            <div className="my-notifications-card">

                <h3>
                    <FaBell /> My Sent Notifications
                </h3>

                {loading ? (
                    <p className="notification-empty">
                        Loading your notifications...
                    </p>
                ) : notifications.length === 0 ? (
                    <p className="notification-empty">
                        You have not sent any notifications yet.
                    </p>
                ) : (
                    <div className="my-notifications-list">

                        {notifications.map((notif) => (
                            <div
                                className="my-notification-item"
                                key={notif._id || notif.id}
                            >
                                <div className="my-notification-head">
                                    <span className="my-notification-title">
                                        {notif.title}
                                    </span>

                                    <div className="my-notification-actions">
                                        <button
                                            className="my-notification-edit"
                                            onClick={() => startEdit(notif)}
                                            disabled={deletingId === (notif._id || notif.id)}
                                            title="Edit notification"
                                        >
                                            <FaEdit />
                                        </button>

                                        <button
                                            className="my-notification-delete"
                                            onClick={() => deleteNotification(notif._id || notif.id)}
                                            disabled={deletingId === (notif._id || notif.id)}
                                            title="Delete notification"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <p className="my-notification-message">
                                    {notif.message}
                                </p>

                                <span className="my-notification-date">
                                    {formatDate(notif.createdAt)}
                                </span>
                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>

    );

}

export default FacultyNotification;