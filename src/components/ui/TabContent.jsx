import { useRef, useEffect, useState } from 'react'
import './TabContent.css'
import { renderControl as renderControlHelper } from './ControlRenderer'
import { EyeIcon, EyeSlashIcon, XMarkIcon, ChevronRightIcon, ChevronDownIcon, PencilIcon } from '@heroicons/react/24/outline'

function TabContent({
  sectionKey,
  section,
  config,
  updateConfig,
  expandedItems,
  toggleItem,
  typeSelectionDropdown,
  setTypeSelectionDropdown,
  createItemWithType,
  removeItem,
  updateArrayItem,
  toggleItemVisibility
}) {
  const dropdownRef = useRef(null)
  const [editingName, setEditingName] = useState(null)
  const [editNameValue, setEditNameValue] = useState('')
  const nameInputRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTypeSelectionDropdown(null)
      }
    }

    if (typeSelectionDropdown === sectionKey) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [typeSelectionDropdown, sectionKey, setTypeSelectionDropdown])

  // Focus name input when editing starts
  useEffect(() => {
    if (editingName !== null && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  const startEditingName = (index, currentName) => {
    setEditingName(index)
    setEditNameValue(currentName || '')
  }

  const saveNameEdit = (index) => {
    if (editingName === index) {
      updateArrayItem(sectionKey, index, 'name', editNameValue.trim() || undefined)
      setEditingName(null)
      setEditNameValue('')
    }
  }

  const cancelNameEdit = () => {
    setEditingName(null)
    setEditNameValue('')
  }

  const handleNameKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      saveNameEdit(index)
    } else if (e.key === 'Escape') {
      cancelNameEdit()
    }
  }

  const toggleTypeSelection = () => {
    if (typeSelectionDropdown === sectionKey) {
      setTypeSelectionDropdown(null)
    } else {
      const typeControl = section.controls.type
      
      if (typeControl && typeControl.type === 'buttons' && typeControl.options) {
        setTypeSelectionDropdown(sectionKey)
      } else {
        // No type selection needed, create item directly
        createItemWithType(sectionKey, null)
      }
    }
  }

  const renderControl = (controlKey, controlConfig, itemData = null, itemIndex = null) => {
    const value = itemData ? itemData[controlKey] : config[sectionKey][controlKey]
    const onChange = itemData
      ? (newValue) => updateArrayItem(sectionKey, itemIndex, controlKey, newValue)
      : (newValue) => updateConfig(sectionKey, controlKey, newValue)

    return renderControlHelper(
      controlKey,
      controlConfig,
      value,
      onChange,
      itemData,
      sectionKey,
      itemIndex,
      updateArrayItem
    )
  }

  if (section.isArray) {
    const items = config[sectionKey] || []
    const typeControl = section.controls.type
    const hasTypeSelection = typeControl && typeControl.type === 'buttons' && typeControl.options
    const isDropdownOpen = typeSelectionDropdown === sectionKey
    
    return (
      <div className="tab-content">
        <div className={`add-item-container ${isDropdownOpen ? 'dropdown-active' : ''}`} ref={isDropdownOpen ? dropdownRef : null}>
          <button
            className="add-item-button"
            onClick={toggleTypeSelection}
          >
            + Add {section.itemLabel || 'Item'}
          </button>
          
          {hasTypeSelection && isDropdownOpen && (
            <div className="type-dropdown">
              {typeControl.options.map(option => (
                <button
                  key={option.value}
                  className="type-dropdown-item"
                  onClick={() => createItemWithType(sectionKey, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {[...items].reverse().map((item, reverseIndex) => {
          const index = items.length - 1 - reverseIndex
          const itemKey = `${sectionKey}-${index}`
          const isExpanded = expandedItems[itemKey]
          const isEditingThisName = editingName === index
          
          // Determine display name
          const displayName = (() => {
            if (item.name) {
              return item.name
            }
            const typeControl = section.controls.type
            if (typeControl && typeControl.options) {
              const typeOption = typeControl.options.find(opt => opt.value === item.type)
              return typeOption ? typeOption.label : item.type
            }
            return section.itemLabel || 'Item'
          })()
          
          return (
            <div key={index} className="array-item">
              <div className="array-item-header" onClick={() => !isEditingThisName && toggleItem(sectionKey, index)}>
                {isEditingThisName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    className="name-edit-input"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => handleNameKeyDown(e, index)}
                    onBlur={() => saveNameEdit(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span>
                    {displayName}
                    {item.hidden ? ' (Hidden)' : ''}
                  </span>
                )}
                <div className="array-item-actions">
                  {!isEditingThisName && (
                    <button
                      className="edit-name-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingName(index, item.name || displayName)
                      }}
                      title="Edit name"
                    >
                      <PencilIcon className="icon" />
                    </button>
                  )}
                  <button
                    className="hide-item-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleItemVisibility(sectionKey, index)
                    }}
                    title={item.hidden ? "Show item" : "Hide item"}
                  >
                    {item.hidden ? <EyeIcon className="icon" /> : <EyeSlashIcon className="icon" />}
                  </button>
                  <button
                    className="remove-item-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(sectionKey, index)
                    }}
                  >
                    <XMarkIcon className="icon" />
                  </button>
                  <span className="toggle-icon">
                    {isExpanded ? <ChevronDownIcon className="icon" /> : <ChevronRightIcon className="icon" />}
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div className="array-item-content">
                  {Object.keys(section.controls).map(controlKey => 
                    renderControl(controlKey, section.controls[controlKey], item, index)
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  } else {
    return (
      <div className="tab-content">
        {Object.keys(section.controls).map(controlKey => 
          renderControl(controlKey, section.controls[controlKey])
        )}
      </div>
    )
  }
}

export default TabContent