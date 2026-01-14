ALTER TABLE `stfnomodel`   
	ADD COLUMN `codmarca` INT(11) NULL AFTER `EsTelefono`;


ALTER TABLE `stfnooperador`   
	ADD COLUMN `mesesRenovacion` SMALLINT(3) NULL AFTER `nombre`;
