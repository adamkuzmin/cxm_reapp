import { Wrapper } from "../../../topbar/patterns/treemap/__styles";
import { SubWrapper } from "../controls";

import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";

import styled from "styled-components";
import { Input, Checkbox } from "antd";
import useStatusStore from "../../../../../store/status-store";
import { useState } from "react";

export const ControlWrapper = styled.div`
  max-width: 160px;
  width: 100%;
`;

export const TreeRow = styled.div`
  width: 100%;

  && .MuiTreeItem-group {
    margin-left: 10px;
  }

  && .MuiTreeItem-iconContainer {
    width: 10px;
    margin-right: 0px;
  }

  && .MuiTreeItem-label {
    padding-left: 0px;
    padding-top: 3.5px;
    padding-bottom: 3.5px;
  }

  &&& > * > * {
    padding-left: 0;
  }
`;

export const Value = styled.div`
  ${({ type }) =>
    type === "string"
      ? `
    color: #249D6B;
  `
      : type === "number"
      ? `color: #ef6016;`
      : ``}
`;

const ModuleString = ({ value, editable, objectName }) => {
  const linksStructure = useStatusStore(({ linksStructure }) => linksStructure);
  const setNeedsRender = useStatusStore(({ setNeedsRender }) => setNeedsRender);

  const handleChange = (e) => {
    if (objectName) {
      const obj = linksStructure.getObjectByName(objectName);
      const val = e.target.value;
      obj.intensity = val;

      setNeedsRender(true);
    }
  };

  return (
    <>
      {editable ? (
        <Input
          style={{ height: "15px", padding: "0px" }}
          onChange={handleChange}
          defaultValue={value}
        />
      ) : (
        <Value type={typeof value}>{value}</Value>
      )}
    </>
  );
};

const ModuleCheck = ({ value }) => {
  return <Checkbox checked />;
};

const ModuleDifition = ({ data, name, editable = false, objectName }) => {
  const { value } = data;

  let isButton = false;
  let isSelect = false;

  let isSlider = false;
  let isDblSlider = false;

  if (typeof value === "object") {
    const { type, options, min, max, value: _value } = value;
    if (type === "button") isButton = true;
    if (options) isSelect = true;

    if (typeof min === "number" && typeof max === "number") {
      isSlider = true;

      if (typeof value === "object") isDblSlider = true;
    }
  }

  let module_;

  if (typeof value === "string" || typeof value === "number") {
    module_ = (
      <ModuleString
        {...{ value, editable: name === "intensity" || editable, objectName }}
      />
    );
  } else if (typeof value === "boolean") {
    module_ = <ModuleCheck />;
  }

  return (
    <>
      {
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: "400", opacity: 0.7 }}>{`${name}:`}</div>

          <ControlWrapper>
            {module_ ? module_ : <ModuleString />}
          </ControlWrapper>
        </div>
      }
    </>
  );
};

const TreeViewEditor = ({ data, onChange = () => {}, objectName }) => {
  let allKeys = [];

  const handleFormat = (data) => {
    if (data && typeof data === "object") {
      const l = Object.keys(data).map((name) => {
        const hasChildren = typeof data[name] === "object";
        const hasArrayChildren = Array.isArray(data[name]);

        const value = data[name];

        let result = {
          name,
        };

        if (hasChildren) {
          if (!hasArrayChildren) {
            result.children = handleFormat(value);
          } else {
            result.children = value.map((item, i) => {
              return {
                name: `${name}_${i}`,
                children: handleFormat(item),
              };
            });
          }
        } else {
          result.value = value;
        }

        return result;
      });

      return l;
    }
  };

  let treeData = { name: "data", children: handleFormat(data) };
  let usedIndex = 0;
  const addId = (data) => {
    const { children } = data;
    data.id = `${usedIndex}`;
    usedIndex += 1;

    if (children) {
      children.map((child) => addId(child));
    }
  };
  addId(treeData);

  const handleId = (data) => {
    const { id } = data;
    const { children } = data;

    allKeys.push(id);

    if (children) {
      children.map((child) => handleId(child));
    }
  };
  handleId(treeData);

  const renderTree = (nodes) => (
    <TreeRow>
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id}
        label={
          nodes.children ? (
            <div
              style={{ fontWeight: "600", marginLeft: "10px" }}
            >{`${nodes.name}`}</div>
          ) : (
            <>
              {
                <ModuleDifition
                  data={nodes}
                  name={nodes.name}
                  {...{ objectName }}
                />
              }
            </>
          )
        }
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </TreeItem>
    </TreeRow>
  );

  return (
    <Wrapper>
      <SubWrapper>
        <TreeView
          aria-label="rich object"
          defaultCollapseIcon={
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <ExpandMoreIcon />
            </div>
          }
          defaultExpanded={allKeys}
          defaultExpandIcon={
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <ChevronRightIcon />
            </div>
          }
          sx={{ flexGrow: 1, maxWidth: 260, overflowY: "auto" }}
        >
          {renderTree(treeData)}
        </TreeView>
      </SubWrapper>
    </Wrapper>
  );
};

export default TreeViewEditor;
