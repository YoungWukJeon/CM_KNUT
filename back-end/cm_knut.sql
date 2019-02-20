-- MySQL dump 10.13  Distrib 5.7.18, for Win64 (x86_64)
--
-- Host: localhost    Database: cm_knut
-- ------------------------------------------------------
-- Server version	5.7.18-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answer`
--

DROP TABLE IF EXISTS `answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answer` (
  `qes_id` int(11) NOT NULL,
  `user_no` int(11) DEFAULT NULL,
  `date` bigint(20) NOT NULL,
  `content` json NOT NULL,
  KEY `qes_id` (`qes_id`),
  KEY `user_no` (`user_no`),
  CONSTRAINT `answer_ibfk_1` FOREIGN KEY (`qes_id`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `answer_ibfk_2` FOREIGN KEY (`user_no`) REFERENCES `user` (`user_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answer`
--

LOCK TABLES `answer` WRITE;
/*!40000 ALTER TABLE `answer` DISABLE KEYS */;
/*!40000 ALTER TABLE `answer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `busboard`
--

DROP TABLE IF EXISTS `busboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `busboard` (
  `id` int(11) NOT NULL,
  `direction` enum('0','1') NOT NULL,
  `dep_time` varchar(10) NOT NULL,
  `arr_time` varchar(10) NOT NULL,
  KEY `id` (`id`),
  CONSTRAINT `busboard_ibfk_1` FOREIGN KEY (`id`) REFERENCES `facilityboard` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `busboard`
--

LOCK TABLES `busboard` WRITE;
/*!40000 ALTER TABLE `busboard` DISABLE KEYS */;
INSERT INTO `busboard` VALUES (4,'0','08:30','08:45'),(4,'0','09:05','09:20'),(4,'0','09:45','10:00'),(4,'0','10:25','10:40'),(4,'0','11:05','11:20'),(4,'0','11:45','12:00'),(4,'0','12:25','12:40'),(4,'1','08:50','09:05'),(4,'1','09:30','09:45'),(4,'1','10:10','10:25'),(4,'1','10:50','11:05'),(4,'1','11:30','11:45'),(4,'1','12:10','12:25'),(4,'1','12:50','13:05');
/*!40000 ALTER TABLE `busboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ub_id` int(11) NOT NULL,
  `user_no` int(11) NOT NULL,
  `date` bigint(20) NOT NULL,
  `content` text NOT NULL,
  `grp_no` int(11) NOT NULL,
  `level` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `ub_id` (`ub_id`),
  KEY `user_no` (`user_no`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`ub_id`) REFERENCES `userboard` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`user_no`) REFERENCES `user` (`user_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commentpreference`
--

DROP TABLE IF EXISTS `commentpreference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commentpreference` (
  `c_id` int(11) NOT NULL,
  `user_no` int(11) NOT NULL,
  `date` bigint(20) NOT NULL,
  KEY `c_id` (`c_id`),
  KEY `user_no` (`user_no`),
  CONSTRAINT `commentpreference_ibfk_1` FOREIGN KEY (`c_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commentpreference_ibfk_2` FOREIGN KEY (`user_no`) REFERENCES `user` (`user_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentpreference`
--

LOCK TABLES `commentpreference` WRITE;
/*!40000 ALTER TABLE `commentpreference` DISABLE KEYS */;
/*!40000 ALTER TABLE `commentpreference` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilityboard`
--

DROP TABLE IF EXISTS `facilityboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facilityboard` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(10) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `name` varchar(30) NOT NULL,
  `content` text,
  `tel` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilityboard`
--

LOCK TABLES `facilityboard` WRITE;
/*!40000 ALTER TABLE `facilityboard` DISABLE KEYS */;
INSERT INTO `facilityboard` VALUES (1,'교육시설',36.969128,127.869656,'중앙정보관','1F : 강의실\n2F : 소프트웨어학과\n3F : 컴퓨터공학과\n4F : 제어계측학과',''),(2,'교육시설',36.969553,127.868787,'IT관','1F : \n2F : 전기공학과\n3F : 전자공학과\n4F : 정보통신 로봇공학과',''),(3,'교육시설',36.972427,127.871872,'건설환경관','1F : 토목공학과\n2F : 환경공학과\n3F : 도시교통공학과\n4F : ',''),(4,'편의시설',36.967958,127.871584,'노천극장 옆 버스 정류장','노천극장 옆 버스정류장입니다. 시간표 참고하세요~',NULL),(5,'교육시설',36.973009,127.872556,'인문사회대학','1F : 비즈니스영어전공\n2F : 영어영문학전공\n3F : 중국어전공\n4F : 행정정보학전공\n5F : 행정학전공',NULL),(6,'교육시설',36.969237,127.873844,'경영항공관','1F : 아이디어 팩토리\n2F : 항공서비스학과\n3F : 경영학전공\n4F : ',NULL),(7,'교육시설',36.968321,127.874139,'시스템관','1F : \n2F : \n3F : \n4F : 항공기계설계정공\n5F : \n6F : 산업경영공학전공',NULL),(8,'교육시설',36.970599,127.871409,'화학생명관','1F : 나노고분자공학전공\n2F : 화공생물공학전공\n3F : \n4F : ',NULL),(9,'편의시설',36.968921,127.872913,'학생회관','1F : \n2F : \n3F : \n4F : ',NULL),(10,'교육시설',36.969676,127.87246,'대학본부','1F : \n2F : \n3F : \n4F : \n5F : \n6F : \n7F : \n8F : ',NULL),(11,'교육시설',36.968839,127.871102,'대학원동','1F : \n2F : \n3F : ',NULL),(12,'교육시설',36.969474,127.871178,'종합강의동','1F : \n2F : 교양학부, 자유전공학부\n3F : 스포츠건강관리학전공, 스포츠산업학전공\n4F : 음악학과',NULL),(13,'교육시설',36.971413,127.871891,'건축관','1F : 건축학전공\n2F : \n3F : 건축공학전공',NULL),(14,'교육시설',36.97167,127.870485,'공동실험관','1F : \n2F : \n3F : \n4F : \n5F : 융합교육창업학부\n6F : ',NULL),(15,'교육시설',36.96812,127.873014,'테크노관','1F : 기계공학전공, 자동차공학전공\n2F : 신소재공학전공, 안전공학전공',NULL);
/*!40000 ALTER TABLE `facilityboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preference`
--

DROP TABLE IF EXISTS `preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preference` (
  `ub_id` int(11) NOT NULL,
  `user_no` int(11) NOT NULL,
  `date` bigint(20) NOT NULL,
  KEY `ub_id` (`ub_id`),
  KEY `user_no` (`user_no`),
  CONSTRAINT `preference_ibfk_1` FOREIGN KEY (`ub_id`) REFERENCES `userboard` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `preference_ibfk_2` FOREIGN KEY (`user_no`) REFERENCES `user` (`user_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preference`
--

LOCK TABLES `preference` WRITE;
/*!40000 ALTER TABLE `preference` DISABLE KEYS */;
/*!40000 ALTER TABLE `preference` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ub_id` int(11) DEFAULT NULL,
  `expired` tinyint(1) NOT NULL DEFAULT '0',
  `title` varchar(30) NOT NULL,
  `content` json NOT NULL,
  `start_time` bigint(20) DEFAULT NULL,
  `end_time` bigint(20) DEFAULT NULL,
  `peopleCount` int(11) DEFAULT NULL,
  `type` enum('vote','survey') NOT NULL,
  `method` enum('time','people') NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ub_id` (`ub_id`),
  CONSTRAINT `question_ibfk_1` FOREIGN KEY (`ub_id`) REFERENCES `userboard` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource` (
  `res_type` enum('image','video') NOT NULL,
  `res_kind` enum('fb','ub','usrp','usrb') NOT NULL,
  `res_key` varchar(100) NOT NULL,
  `res_url` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource`
--

LOCK TABLES `resource` WRITE;
/*!40000 ALTER TABLE `resource` DISABLE KEYS */;
INSERT INTO `resource` VALUES ('image','fb','1','res/images/facilityboard/1_1.jpg'),('image','fb','1','res/images/facilityboard/1_2.jpg'),('image','fb','1','res/images/facilityboard/1_3.jpg'),('image','fb','1','res/images/facilityboard/1_4.png'),('image','usrp','1','res/images/profile/1.jpeg'),('image','ub','1','res/images/userboard/1_1.jpg'),('image','ub','1','res/images/userboard/1_2.jpg'),('image','ub','1','res/images/userboard/1_3.jpg'),('image','ub','1','res/images/userboard/1_4.png'),('image','ub','2','res/images/userboard/2_1.jpg'),('image','usrb','1','res/images/background/1.jpeg'),('image','usrp','3','https://phinf.pstatic.net/contact/75/2011/5/14/dnr87_1305302762735.jpg'),('image','usrp','4','https://graph.facebook.com/1341558052592224/picture?type=large'),('image','usrp','5','https://graph.facebook.com/1292519744201945/picture?type=large'),('image','usrp','6','https://graph.facebook.com/1341558052592224/picture?type=large'),('image','usrp','8','http://mud-kage.kakao.co.kr/14/dn/btqggTsqzHh/QKcOkvFZGm4DZdHiCn6Ry1/o.jpg'),('image','usrp','22','https://ssl.pstatic.net/static/pwe/address/img_profile.png'),('image','usrp','2','res/images/profile/2.jpeg'),('image','usrb','2','res/images/background/2.jpeg');
/*!40000 ALTER TABLE `resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_no` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('f','k','n','g','s') NOT NULL,
  `id` varchar(100) NOT NULL,
  `pw` varchar(50) DEFAULT NULL,
  `nickname` varchar(20) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `intro` text,
  `info` text,
  `regist_time` bigint(20) NOT NULL,
  `modify_time` bigint(20) NOT NULL,
  `priv` enum('admin','general') NOT NULL DEFAULT 'general',
  `gender` enum('male','female') DEFAULT NULL,
  `birth` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`user_no`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (9,'s','test@seam.com','testpass','카니',NULL,NULL,NULL,1496149677189,1496149677189,'general','male','2004-03-01');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userboard`
--

DROP TABLE IF EXISTS `userboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userboard` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_no` int(11) DEFAULT NULL,
  `category` varchar(10) NOT NULL,
  `coords` json NOT NULL,
  `name` varchar(30) NOT NULL,
  `content` text NOT NULL,
  `sub_content` enum('vote','survey') DEFAULT NULL,
  `regist_time` bigint(20) NOT NULL,
  `event` enum('y','n','e') NOT NULL DEFAULT 'n',
  `expire_time` bigint(20) DEFAULT NULL,
  `modify_time` bigint(20) NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0',
  `tag` text,
  PRIMARY KEY (`id`),
  KEY `user_no` (`user_no`),
  CONSTRAINT `userboard_ibfk_1` FOREIGN KEY (`user_no`) REFERENCES `user` (`user_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userboard`
--

LOCK TABLES `userboard` WRITE;
/*!40000 ALTER TABLE `userboard` DISABLE KEYS */;
/*!40000 ALTER TABLE `userboard` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-02-21  6:20:03
