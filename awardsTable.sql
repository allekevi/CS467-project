CREATE TABLE `awards` (
  `award_id` int(11) NOT NULL AUTO_INCREMENT,
  `award_name` varchar(255) NOT NULL,
  PRIMARY KEY (`award_id`),
  UNIQUE KEY `award_id_UNIQUE` (`award_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8