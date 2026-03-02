-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 12:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `food_narration_poc`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Ốc - Hải sản'),
(2, 'Nướng'),
(3, 'Lẩu'),
(4, 'Ăn vặt'),
(5, 'Trà sữa - Nước uống'),
(6, 'Cơm - Món chính');

-- --------------------------------------------------------

--
-- Table structure for table `food_places`
--

CREATE TABLE `food_places` (
  `id` int(11) NOT NULL,
  `narration_point_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `price_range` varchar(50) DEFAULT NULL,
  `opening_hours` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `food_places`
--

INSERT INTO `food_places` (`id`, `narration_point_id`, `category_id`, `price_range`, `opening_hours`, `description`) VALUES
(1, 2, 1, '50,000 - 150,000 VND', '16:00 - 23:30', 'Quán Ốc Phát nổi tiếng tại phố ẩm thực Vĩnh Khánh với đa dạng các món ốc tươi ngon, chế biến đậm đà, thu hút đông đảo thực khách mỗi tối.'),
(2, 3, 6, '40,000 - 120,000 VND', '10:00 - 22:00', 'Gà Vịt Phúc Lợi chuyên các món vịt quay, gà quay thơm ngon, giá bình dân, rất phù hợp cho bữa ăn no tại khu Vĩnh Khánh.');

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `narration_point_id` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `narration_points`
--

CREATE TABLE `narration_points` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `activation_radius` int(11) NOT NULL DEFAULT 20,
  `priority` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `narration_points`
--

INSERT INTO `narration_points` (`id`, `name`, `latitude`, `longitude`, `activation_radius`, `priority`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Cổng Phố Ẩm Thực Vĩnh Khánh', 10.7619570, 106.7019690, 80, 1, 1, '2026-01-31 20:34:53', '2026-03-01 16:58:48'),
(2, 'Ốc Phát – Ốc Ngon Quận 4', 10.7619545, 106.7020937, 30, 2, 1, '2026-01-31 20:40:09', '2026-03-01 16:46:56'),
(3, 'Gà Vịt Phúc Lợi', 10.7618930, 106.7020740, 30, 3, 1, '2026-01-31 20:41:35', '2026-03-01 17:01:44');

-- --------------------------------------------------------

--
-- Table structure for table `narration_translations`
--

CREATE TABLE `narration_translations` (
  `id` int(11) NOT NULL,
  `narration_point_id` int(11) NOT NULL,
  `language_code` varchar(10) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `narration_point_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `food_places`
--
ALTER TABLE `food_places`
  ADD PRIMARY KEY (`id`),
  ADD KEY `narration_point_id` (`narration_point_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `narration_point_id` (`narration_point_id`);

--
-- Indexes for table `narration_points`
--
ALTER TABLE `narration_points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `narration_translations`
--
ALTER TABLE `narration_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_narration_language` (`narration_point_id`,`language_code`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `narration_point_id` (`narration_point_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `food_places`
--
ALTER TABLE `food_places`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `narration_points`
--
ALTER TABLE `narration_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `narration_translations`
--
ALTER TABLE `narration_translations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `food_places`
--
ALTER TABLE `food_places`
  ADD CONSTRAINT `food_places_ibfk_1` FOREIGN KEY (`narration_point_id`) REFERENCES `narration_points` (`id`),
  ADD CONSTRAINT `food_places_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `images_ibfk_1` FOREIGN KEY (`narration_point_id`) REFERENCES `narration_points` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `narration_translations`
--
ALTER TABLE `narration_translations`
  ADD CONSTRAINT `fk_narration` FOREIGN KEY (`narration_point_id`) REFERENCES `narration_points` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`narration_point_id`) REFERENCES `narration_points` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
