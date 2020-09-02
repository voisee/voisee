-- MySQL dump 10.13  Distrib 8.0.19, for osx10.15 (x86_64)
--
-- Host: 127.0.0.1    Database: voisee
-- ------------------------------------------------------
-- Server version	5.5.5-10.5.5-MariaDB-1:10.5.5+maria~focal

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `categoryid` int(11) NOT NULL AUTO_INCREMENT,
  `categoryname` varchar(45) NOT NULL,
  PRIMARY KEY (`categoryid`),
  UNIQUE KEY `categoryname_UNIQUE` (`categoryname`),
  UNIQUE KEY `categoryid_UNIQUE` (`categoryid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'English'),(2,'Phone');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contents`
--

DROP TABLE IF EXISTS `contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contents` (
  `statement_id` int(11) NOT NULL AUTO_INCREMENT,
  `job_name` varchar(45) NOT NULL,
  `spk_label` varchar(45) NOT NULL,
  `start_time` float NOT NULL,
  `end_time` float NOT NULL,
  `content` varchar(200) NOT NULL,
  PRIMARY KEY (`statement_id`),
  KEY `job_name_idx` (`job_name`),
  CONSTRAINT `job_name` FOREIGN KEY (`job_name`) REFERENCES `statements` (`job_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contents`
--

LOCK TABLES `contents` WRITE;
/*!40000 ALTER TABLE `contents` DISABLE KEYS */;
INSERT INTO `contents` VALUES (1,'twTtsn8UM','spk_0',3.24,14.01,'so basically way learn it at school. You start up when your third grade goes all the way up to 12th grade. Yeah. Those finals in English. I gotta say way. Take it pretty seriously. '),(2,'twTtsn8UM','spk_1',14.02,15.55,'Your English is really good. Yeah. '),(3,'twTtsn8UM','spk_0',15.56,22.06,'Thank you. When you want to go to university and you gotta take English English classes, mandatory water, some '),(4,'twTtsn8UM','spk_1',22.06,26.73,'things about the Israel English education that are really good. What are you doing, right? The best '),(5,'twTtsn8UM','spk_0',26.73,27.01,'thing.');
/*!40000 ALTER TABLE `contents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statements`
--

DROP TABLE IF EXISTS `statements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statements` (
  `job_id` int(11) NOT NULL AUTO_INCREMENT,
  `job_name` varchar(45) NOT NULL,
  `statement_name` varchar(45) NOT NULL,
  `categoryid` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `record_url` varchar(100) NOT NULL,
  PRIMARY KEY (`job_id`,`job_name`),
  UNIQUE KEY `statement_name_UNIQUE` (`statement_name`),
  UNIQUE KEY `job_name_UNIQUE` (`job_name`),
  UNIQUE KEY `job_id_UNIQUE` (`job_id`),
  KEY `categoryid_idx` (`categoryid`),
  CONSTRAINT `categoryid` FOREIGN KEY (`categoryid`) REFERENCES `categories` (`categoryid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statements`
--

LOCK TABLES `statements` WRITE;
/*!40000 ALTER TABLE `statements` DISABLE KEYS */;
INSERT INTO `statements` VALUES (9,'twTtsn8UM','post테스트',2,1,'테스트입니다','https://voisee.s3.ap-northeast-2.amazonaws.com/twTtsn8UM.m4a');
/*!40000 ALTER TABLE `statements` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-08-31 19:46:31
