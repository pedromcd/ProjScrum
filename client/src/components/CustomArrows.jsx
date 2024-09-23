import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

const CustomPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button className='slick-prev' onClick={onClick}>
      <FontAwesomeIcon icon={faAngleLeft} />
    </button>
  );
};

const CustomNextArrow = (props) => {
  const { onClick } = props;
  return (
    <button className='slick-next' onClick={onClick}>
      <FontAwesomeIcon icon={faAngleRight} />
    </button>
  );
};

export { CustomPrevArrow, CustomNextArrow };
