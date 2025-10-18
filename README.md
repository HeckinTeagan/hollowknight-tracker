# 🐛 Hollow Knight Grub Checklist Tracker 🦋

This application serves as a dedicated, cloud-synced checklist for tracking the 46 Grubs rescued throughout the world of Hallownest from the game *Hollow Knight*.

Users can sign up for an account to save their progress persistently across devices using a MongoDB database, or proceed as a **Guest** to save progress locally in their browser.

## 🚀 Key Features

* **Persistent Tracking:** User accounts save grub status to a secure MongoDB backend.
* **Guest Mode:** Allows immediate tracking using local browser storage with the option to convert this progress later.
* **Grub Lists by Area:** The checklist is broken down by the major areas of the game for easy reference.
* **Responsive Design:** Works well on both desktop and mobile devices.

---

## 🛠️ Technology Stack

This project is deployed using a standard Jamstack architecture, ideal for a lightweight tracker:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML, CSS, Vanilla JavaScript | Hosted completely on **GitHub Pages**. |
| **Backend API** | Node.js (Express) | Deployed on **Render** to handle user authentication and data persistence. |
| **Database** | MongoDB | Cloud database service for secure storage of user data and checklist status. |

---

## 🔗 Live Application & API

* **Frontend URL (GitHub Pages):** https://heckinteagan.github.io/hollowknight-tracker/grub_checklist.html
* **Backend API Base URL (Render):** `https://grub-tracker-api.onrender.com/api`

---

## 📖 How to Use

1.  **Access:** Navigate to the [Frontend URL](#live-application--api).
2.  **Authentication:**
    * **Signed-Up User:** Log in with your credentials to sync your progress with the cloud.
    * **Guest User:** Click **"Continue as Guest"** to save your progress locally in your browser.
3.  **Tracking:** Simply check the box next to any grub you have rescued. The counter at the top will update, and your progress will be saved automatically (to the cloud or local storage, depending on your mode).
4.  **Rewards:** The list at the bottom tracks the rewards you receive from the Grubfather based on the total number of grubs rescued.

---

## 💡 Future Improvements

* **Guest Conversion:** Implement a feature to seamlessly transfer a Guest's local progress to the cloud when they sign up.
* **Image Preview:** Generate a high-quality preview image for social media sharing cards.
* **Code Quality:** Further refinement of API error handling and input validation.