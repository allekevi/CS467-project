CREATE TABLE `user_awards` (
  `user_id` int(11) NOT NULL,
  `award_id` int(11) NOT NULL,
  `award_date` date NOT NULL,
  `award_comments` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_date` date NOT NULL,
  `modified_by` varchar(255) NOT NULL,
  `last_modified` date NOT NULL,
  `active_flag` tinyint(1) NOT NULL,
  KEY `awards_idx` (`award_id`),
  KEY `userID_idx` (`user_id`),
  CONSTRAINT `awardID` FOREIGN KEY (`award_id`) REFERENCES `awards` (`award_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userID` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8