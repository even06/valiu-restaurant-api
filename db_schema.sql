-- phpMyAdmin SQL Dump
-- version 5.1.4deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 29, 2024 at 06:53 AM
-- Server version: 8.0.33-0ubuntu0.22.10.2
-- PHP Version: 8.1.7-1ubuntu3.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `valiu_restaurant`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `category_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`) VALUES
(1, 'Italian'),
(2, 'Tapas'),
(3, 'Mexican'),
(4, 'Japanese'),
(5, 'Sushi'),
(6, 'Pizza'),
(7, 'American');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int NOT NULL,
  `table_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `guests` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `table_id`, `date`, `name`, `email`, `guests`) VALUES
(12, 31, '2024-04-24', 'Pablo', 'pablo.nicolas.petran@gmail.com', 3),
(13, 29, '2024-04-24', 'Pablo', 'pablo.nicolas.petran@gmail.com', 3),
(14, 30, '2024-04-24', 'Pablo', 'pablo.nicolas.petran@gmail.com', 3);

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `img_url` varchar(1024) NOT NULL,
  `categories` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `name`, `img_url`, `categories`) VALUES
(1, 'The Italian Corner', 'https://resizer.otstatic.com/v2/photos/wide-medium/1/53965686.webp', 1),
(2, 'O\'flaherty', 'https://resizer.otstatic.com/v2/photos/wide-medium/5/42299972.webp', 2),
(3, 'Momma\'s Kitchen', 'https://resizer.otstatic.com/v2/photos/wide-medium/3/61038538.webp', 7),
(4, 'Sushi Club', 'https://resizer.otstatic.com/v2/photos/wide-medium/3/62411333.webp', 4),
(5, 'Le Jardin', 'https://resizer.otstatic.com/v2/photos/wide-medium/2/62551277.webp', 2),
(6, 'El Secreto de Rosita', 'https://resizer.otstatic.com/v2/photos/wide-medium/2/48198044.webp', 3),
(7, 'The Pembroke', 'https://resizer.otstatic.com/v2/photos/wide-medium/2/54381049.webp', 4),
(8, 'Jaleo - DC', 'https://resizer.otstatic.com/v2/photos/wide-medium/2/56987725.webp', 7),
(9, 'China Chilcano', 'https://resizer.otstatic.com/v2/photos/wide-medium/2/57156452.webp', 5),
(10, 'Bombay Club', 'https://resizer.otstatic.com/v2/photos/wide-medium/1/23677466.webp', 5),
(11, 'Cubanos', 'https://resizer.otstatic.com/v2/photos/wide-medium/3/63855030.webp', 6),
(12, 'Java Nation', 'https://resizer.otstatic.com/v2/photos/wide-medium/3/62821172.webp', 7);

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `id` int NOT NULL,
  `restaurant_id` int DEFAULT NULL,
  `num_seats` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `restaurant_id`, `num_seats`) VALUES
(1, 1, 2),
(2, 1, 2),
(3, 1, 2),
(4, 1, 4),
(5, 1, 4),
(6, 1, 4),
(7, 2, 4),
(8, 2, 4),
(9, 2, 4),
(10, 2, 4),
(11, 2, 6),
(12, 2, 6),
(13, 4, 4),
(14, 4, 4),
(15, 4, 4),
(16, 4, 4),
(17, 4, 2),
(18, 4, 2),
(19, 4, 2),
(20, 4, 2),
(21, 3, 4),
(22, 3, 4),
(23, 3, 2),
(24, 3, 4),
(25, 10, 2),
(26, 10, 2),
(27, 10, 4),
(28, 10, 4),
(29, 9, 6),
(30, 9, 6),
(31, 9, 4),
(32, 9, 2),
(33, 11, 8),
(34, NULL, 8),
(35, 6, 2),
(36, 6, 2),
(37, 6, 2),
(38, 6, 2),
(39, 6, 2),
(40, 6, 4),
(41, 8, 4),
(42, 8, 4),
(43, 8, 3),
(44, 12, 4),
(45, 12, 4),
(46, 12, 4),
(47, 5, 5),
(48, 5, 5),
(49, 5, 2),
(50, 5, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`);

--
-- Constraints for table `tables`
--
ALTER TABLE `tables`
  ADD CONSTRAINT `tables_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
