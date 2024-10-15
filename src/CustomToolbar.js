import React from 'react';
import { locales } from './fr'; // Importez votre configuration locale

const CustomToolbar = (toolbar) => {
  const { onNavigate, label } = toolbar;
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY')}>{locales.toolbar.today}</button>
        <button type="button" onClick={() => onNavigate('PREV')}>{locales.toolbar.back}</button>
        <button type="button" onClick={() => onNavigate('NEXT')}>{locales.toolbar.next}</button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('MONTH')}>{locales.toolbar.month}</button>
        <button type="button" onClick={() => onNavigate('WEEK')}>{locales.toolbar.week}</button>
        <button type="button" onClick={() => onNavigate('DAY')}>{locales.toolbar.day}</button>
      </span>
    </div>
  );
};

export default CustomToolbar;
