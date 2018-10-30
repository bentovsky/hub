CREATE TABLE IF NOT EXISTS `Listing` (
  `ListingID` int(11) NOT NULL AUTO_INCREMENT,
  `nodeID` int(11) NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ListingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `NodeErrors` (
  `NodeErrorsID` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SensorID` int(11) DEFAULT NULL,
  PRIMARY KEY (`NodeErrorsID`),
  KEY `SensorID` (`SensorID`),
  CONSTRAINT `NodeErrors_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `Listing` (`ListingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ReceivedAction` (
  `ActionsID` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SensorID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ActionsID`),
  KEY `SensorID` (`SensorID`),
  CONSTRAINT `ReceivedAction_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `Listing` (`ListingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ReceivedConfig` (
  `ReceivedConfigID` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` int(11) DEFAULT NULL,
  `SensorID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ReceivedConfigID`),
  KEY `SensorID` (`SensorID`),
  CONSTRAINT `ReceivedConfig_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `Listing` (`ListingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ReceivedValue` (
  `ReceivedValueID` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `SensorID` int(11) DEFAULT NULL,
  `matrix` text COLLATE utf8mb4_unicode_ci,
  `sizeX` int(11) DEFAULT NULL,
  `sizeY` int(11) DEFAULT NULL,
  `orientation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ReceivedValueID`),
  KEY `SensorID` (`SensorID`),
  CONSTRAINT `ReceivedValue_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `Listing` (`ListingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;









