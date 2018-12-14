CREATE TABLE IF NOT EXISTS `listing` (
  `listingID` int(11) NOT NULL AUTO_INCREMENT,
  `nodeID` int(11) NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`listingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nodeErrors` (
  `nodeErrorsID` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensorID` int(11) DEFAULT NULL,
  PRIMARY KEY (`nodeErrorsID`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `nodeErrors_ibfk_1` FOREIGN KEY (`sensorID`) REFERENCES `listing` (`listingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `receivedAction` (
  `actionsID` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sensorID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ActionsID`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `receivedAction_ibfk_1` FOREIGN KEY (`sensorID`) REFERENCES `listing` (`listingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `receivedConfig` (
  `receivedConfigID` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` int(11) DEFAULT NULL,
  `sensorID` int(11) DEFAULT NULL,
  PRIMARY KEY (`receivedConfigID`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `receivedConfig_ibfk_1` FOREIGN KEY (`sensorID`) REFERENCES `listing` (`listingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `receivedValue` (
  `receivedValueID` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensorID` int(11) DEFAULT NULL,
  `matrix` text COLLATE utf8mb4_unicode_ci,
  `sizeX` int(11) DEFAULT NULL,
  `sizeY` int(11) DEFAULT NULL,
  `orientation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`receivedValueID`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `receivedValue_ibfk_1` FOREIGN KEY (`sensorID`) REFERENCES `listing` (`listingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;









