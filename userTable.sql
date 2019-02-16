CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `admin_flag` tinyint(1) NOT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `create_date` date NOT NULL,
  `modified_by` varchar(255) NOT NULL,
  `modified_date` date NOT NULL,
  `active_flag` tinyint(1) unsigned zerofill NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8