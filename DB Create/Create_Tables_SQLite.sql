CREATE TABLE `person_status` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `status` varchar(100) NOT NULL
);


CREATE TABLE `person` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  `f_name` varchar(50) DEFAULT NULL,
  `l_name` varchar(50) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `logon_id` varchar(30) NOT NULL UNIQUE,
  `password` varchar(50) DEFAULT NULL,
  `last_logged_on` datetime DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `status_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  CONSTRAINT `person_person_status_id` FOREIGN KEY (`status_id`) REFERENCES `person_status` (`id`) ON UPDATE CASCADE
);


CREATE TABLE `publisher` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(350) NOT NULL
);


CREATE TABLE `language` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(100) NOT NULL
);


CREATE TABLE `genre` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `type` varchar(100) NOT NULL
);


CREATE TABLE `format` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `type` varchar(150) NOT NULL
);


CREATE TABLE `author` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(100) NOT NULL
);

CREATE TABLE `award` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(350) NOT NULL
);

CREATE TABLE `book` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` varchar(350) NOT NULL,
  `series` varchar(250) DEFAULT NULL,
  `rating` decimal(5,2) DEFAULT '-1.00',
  `description` varchar(2500) DEFAULT NULL,
  `isbn` varchar(30) DEFAULT NULL,
  `edition` varchar(150) DEFAULT NULL,
  `pages` int(10) DEFAULT '-1',
  `publishDate` date DEFAULT NULL,
  `numRatings` int(11) DEFAULT NULL,
  `likedPercent` decimal(5,2) DEFAULT NULL,
  `coverImg` varchar(300) DEFAULT NULL,
  `price` decimal(5,2) DEFAULT '-1.00',
  `lang_id` int DEFAULT NULL,
  `publisher_id` int DEFAULT NULL,
  CONSTRAINT `book_lang_id` FOREIGN KEY (`lang_id`) REFERENCES `language` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_publisher_id` FOREIGN KEY (`publisher_id`) REFERENCES `publisher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `book_author` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `book_id` int NOT NULL,
  `author_id` int NOT NULL,
  CONSTRAINT `book_author_author_id` FOREIGN KEY (`author_id`) REFERENCES `author` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_author_book_id` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `book_award` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `book_id` int NOT NULL,
  `award_id` int NOT NULL,
  CONSTRAINT `book_award_award_id` FOREIGN KEY (`award_id`) REFERENCES `award` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_award_book_id` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `book_format` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `book_id` int NOT NULL,
  `format_id` int NOT NULL,
  CONSTRAINT `book_format_book_id` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_format_format_id` FOREIGN KEY (`format_id`) REFERENCES `format` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `book_genre` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `book_id` int NOT NULL,
  `genre_id` int NOT NULL,
  CONSTRAINT `book_genre_book_id` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_genre_genre_id` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `borrow_status` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `status` varchar(100) NOT NULL
);


CREATE TABLE `book_copy` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `book_id` int NOT NULL,
  `borrow_status_id` int NOT NULL,
  CONSTRAINT `book_copy_book_id` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_copy_borrow_status_id` FOREIGN KEY (`borrow_status_id`) REFERENCES `borrow_status` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `borrowal` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `book_copy_id` int NOT NULL,
  `person_id` int NOT NULL,
  `borrow_date` date NOT NULL,
  `return_date` date NOT NULL,
  CONSTRAINT `book_borrowal_book_copy_id` FOREIGN KEY (`book_copy_id`) REFERENCES `book_copy` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `book_borrowal_person_id` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
