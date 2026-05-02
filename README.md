# 🌟 Habit Tracker Dashboard (With Login System)

A modern and interactive Habit Tracker Dashboard designed to help users track daily habits, analyze progress, and stay consistent with a built-in **username/password login system** and **auto-saving habit data per user**.

---

## 🚀 Live Demo

🔗 https://habit-tracker-dashboard-cv55.onrender.com

---

## 🔐 Authentication System

* Simple **Username & Password Login**
* No Gmail or external authentication required
* Each user has their **own saved data**
* Data persists even after refresh or reopening

---

## 📌 Features

* 🎯 **Overall Progress Tracker**

  * Monthly completion %
  * Animated progress ring & bar

* 📊 **Weekly Overview**

  * 6-week cards with donut charts

* 📋 **Habit Calendar Grid**

  * Clickable daily tracking

* ➕ **Habit Management**

  * Add / Edit / Delete habits
  * Emoji support 🎉

* 📈 **Analysis Section**

  * Goal vs Actual tracking
  * Color-coded progress

* 📅 **Month Navigation**

  * Switch between months easily

* 💾 **Auto Save (User-Based)**

  * Data saved per user using localStorage
  * No data loss after refresh

* 🔐 **Login System**

  * Secure session-like experience (frontend-based)
  * User-specific habit tracking

* 🎨 **Modern UI**

  * Dark theme + glassmorphism
  * Smooth animations

---

## 🛠️ Tech Stack

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* LocalStorage (User-based persistence)

---

## 📁 Project Structure

```text
habit-tracker-dashboard/
│── index.html
│── index.css
│── app.js
│── login.js (new)
│── auth.js (new)
```

---

## ⚙️ How It Works

1. User signs up with username & password
2. Credentials stored in localStorage
3. On login:

   * User session is created
   * Unique key is used to store habits
4. Data is saved like:

```js
habit_data_username
```

👉 Example:

```js
habit_data_bhanu
```

---

## ⚙️ How to Run Locally

1. Clone/download repo
2. Open folder
3. Open `index.html`

---

## 📸 Screenshots
<img width="1915" height="972" alt="image" src="https://github.com/user-attachments/assets/53ea6ed7-a353-4fb8-b2b5-b541bb1282c1" />
<img width="1919" height="975" alt="image" src="https://github.com/user-attachments/assets/cf8af110-7ed0-436f-9d77-83eb34a29760" />





---

## ⚠️ Limitations

* Authentication is **frontend-based (not secure for production)**
* Data stored only in browser (localStorage)
* No cloud sync

---

## 🔮 Future Improvements

* 🔐 Real authentication (JWT / Firebase)
* ☁️ Cloud database (Firestore / Supabase)
* 📱 Mobile optimization
* 👥 Multi-device sync

---

## 🤝 Contributing

Open for contributions 🚀

---

## 👨‍💻 Author

**Bhanu Pratap Singh**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
