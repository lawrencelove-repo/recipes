-- Store optional high end of a quantity range (e.g. 4-6 chicken thighs).
-- quantity remains the low end; NULL quantity_max means a single amount.
ALTER TABLE ingredients ADD COLUMN quantity_max REAL;
