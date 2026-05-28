# Auto Nest Car Rental Backend

## Project Overview
Auto Nest Car Rental is a backend-driven web application for managing car rentals. It provides an admin dashboard for managing inventory, bookings, and account settings, while also offering a public-facing site where customers can browse available vehicles and submit rental requests.

## Key Features
- Admin dashboard with sections for:
  - Dashboard analytics and overview
  - Inventory management
  - Booking management
  - Settings and admin account management
- Site preview available directly inside the admin interface using an embedded iframe
- Contact form integration using Resend for email delivery
- PHP backend with data storage supported through MySQL
- Lightweight MVC-style structure using organized controllers, models, and views

## Technologies Used
- PHP (7.4+ compatible)
- MySQL
- JavaScript for frontend interactivity
- HTML/CSS for admin and public UI
- `vlucas/phpdotenv` for environment configuration
- `resend/resend-php` for contact form email delivery

## Installation
1. Clone the repository:
   ```bash
   git clone repository-url
   cd Auto-Nest-Car-Rental-Backend
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your local database credentials and Resend email settings.
4. Create the database and import required tables using the SQL scripts or by following the application setup.
5. Start your local web server (XAMPP, WAMP, or similar) and point the document root to the project folder.
6. Open `http://localhost/Auto-Nest-Car-Rental-Backend/admin.php` to access the admin dashboard.

## Environment Variables
Make sure the following variables are set in `.env`:
- `DB_HOST` — database host (usually `localhost`)
- `DB_PORT` — database port (usually `3306`)
- `DB_NAME` — database name
- `DB_USER` — database username
- `DB_PASS` — database password
- `RESEND_API_KEY` — API key for Resend email delivery
- `CONTACT_TO_EMAIL` — recipient email for contact form submissions
- `CONTACT_FROM_EMAIL` — verified sender email for Resend

## Admin Access
- Access the admin dashboard at `admin.php`
- The admin interface includes inventory, bookings, settings, and a site preview section

## Team Members
| No. | GitHub Profile | Name | Student ID |
| --- | -------------- | ---- | ---------- |
| 1 | https://github.com/bereket-dev | Bereket Desalegn Eshete | ETS0251/16 |
| 2 | https://github.com/befeleo | Befiker Kassahun Tessema | ETS0236/16 |
| 3 | https://github.com/abinishifex | Abenezer Shiferaw Talta | ETS0067/16 |
| 4 | https://github.com/bereket-tesAye | Bereket Tesfaye Wakshume | ETS0259/16 |
| 5 | https://github.com/Beti6289 | Betlihem Degefu Abebe | ETS0283/16 |

## Notes
- Ensure your web server can serve PHP files and has access to the MySQL database.
- If using XAMPP, place the project inside `htdocs` and use the XAMPP control panel to start Apache and MySQL.
- For local testing, verify that `public/index.php` loads correctly before using the admin site preview.
