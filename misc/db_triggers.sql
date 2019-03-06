DELIMITER $$

CREATE TRIGGER ratinginit AFTER INSERT ON user
	FOR EACH ROW
	BEGIN
		INSERT INTO ratinghistory (userid, rating, changedate)
		VALUES (NEW.userid, NEW.rating, NOW());
END

$$

CREATE TRIGGER ratingupdate AFTER UPDATE ON user
	FOR EACH ROW
	BEGIN
    IF NEW.rating <> OLD.rating THEN
	    INSERT INTO ratinghistory (userid, rating, changedate)
        VALUES (new.userid, new.rating, NOW());
    END IF;
END 

$$

DELIMITER ;


