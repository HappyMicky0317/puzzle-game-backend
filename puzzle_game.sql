-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:87
-- Generation Time: Aug 03, 2023 at 02:37 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `puzzle_game`
--

-- --------------------------------------------------------

--
-- Table structure for table `bonus_clues`
--

CREATE TABLE `bonus_clues` (
  `id` int(5) NOT NULL,
  `question` text NOT NULL,
  `category_id` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bonus_clues`
--

INSERT INTO `bonus_clues` (`id`, `question`, `category_id`) VALUES
(1, 'is it man?', 1),
(2, 'Is it European?', 1),
(3, 'Is it American?', 1),
(4, 'Is it Asian?', 1),
(5, 'Is it woman?', 1),
(6, 'Is it African?', 1),
(7, 'Does it play with ball?', 1),
(8, 'Is it an Olympic winner?', 1),
(9, 'Is it team sports?', 1),
(10, 'Is it play on the grand? ', 1);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(5) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`) VALUES
(1, 'sportsperson'),
(2, 'sports'),
(3, 'writer'),
(4, 'painter'),
(5, 'mountain'),
(6, 'river'),
(7, 'city'),
(8, 'ancient ruins'),
(9, 'politician'),
(10, 'plants');

-- --------------------------------------------------------

--
-- Table structure for table `main_object`
--

CREATE TABLE `main_object` (
  `id` int(7) NOT NULL,
  `name` varchar(50) NOT NULL,
  `category_id` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_object`
--

INSERT INTO `main_object` (`id`, `name`, `category_id`) VALUES
(1, 'Cristiano Ronaldo', 1),
(2, 'Lionel Messi', 1),
(3, 'Michael Jordan', 1),
(4, 'Serena Williams', 1),
(5, 'Usain Bolt', 1),
(6, 'Roger Federer', 1),
(7, 'LeBron James', 1),
(8, 'Tom Brady', 1),
(9, 'Muhammad Ali', 1),
(10, 'Diego Maradona ', 1),
(11, 'Kobe Bryant', 1),
(12, 'Rafael Nadal', 1),
(13, 'Tiger Woods', 1),
(14, 'Neymar Jr.', 1),
(15, 'Simone Biles', 1),
(16, 'Lewis Hamilton', 1),
(17, 'Wayne Gretzky', 1),
(18, 'Michael Phelps', 1),
(19, 'Zlatan Ibrahimovic', 1),
(20, 'Novak Djokovic', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bonus_clues`
--
ALTER TABLE `bonus_clues`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `main_object`
--
ALTER TABLE `main_object`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bonus_clues`
--
ALTER TABLE `bonus_clues`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `main_object`
--
ALTER TABLE `main_object`
  MODIFY `id` int(7) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
