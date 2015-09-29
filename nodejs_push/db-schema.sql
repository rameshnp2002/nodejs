/*
	Host           : localhost
	Database       : nodejs
	table 		   : notification_message
	Date		   : 09/27/2015
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `notification_message`
-- ----------------------------
DROP TABLE IF EXISTS `notification_message`;
CREATE TABLE `notification_message` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('notice','info','urgent','popup') NOT NULL DEFAULT 'notice',
  `user_id` int(10) NOT NULL DEFAULT '0',
  `message` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `node_users`
-- ----------------------------
BEGIN;
 insert into notification_message (type,user_id,message) values('info',0,'Welcome'), ('notice',0,'Please change your password');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
