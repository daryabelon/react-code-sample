import { find, findIndex, get, last } from 'lodash';
import {
  addNodeUnderIndexParent,
  addNodeUnderParent,
  changeNodeAtPath,
  getFlatDataFromTree,
  getTreeFromFlatData,
  removeNode,
  removeNodeAtPath,
} from 'react-sortable-tree';
import { v4 } from 'uuid';

export const createRoot = (flatData) => {
  return getTreeFromFlatData({
    flatData,
    getParentKey: (node) => node.project_parent_id,
    rootKey: null,
  });
};

export const toggleExpanded = (tree, path, node) => {
  const newNode = { ...node };
  newNode.expanded = !node.expanded;
  return changeNode(tree, path, newNode);
};

export const uniqueId = (id, shift) => {
  return id ? id + shift : new Date().valueOf();
};

export const changeNode = (treeData, path, newNode) => {
  return changeNodeAtPath({
    treeData,
    path,
    newNode,
    getNodeKey: getNodeKey,
    ignoreCollapsed: true,
  });
};

export const changeNodeById = (tree, idNode, newNode) => {
  const path = getNodePathById(idNode, tree);
  return changeNode(tree, path, newNode);
};

export const getNodeKey = ({ node }) => node.id;

export const getNodeById = (idNode, treeData) => {
  const flatData = getFlatData(treeData);
  return find(flatData, { node: { id: idNode } });
};

export const getNodePathById = (idNode, treeData) => {
  const node = getNodeById(idNode, treeData);
  return get(node, 'path', null);
};

export const getExpandedDepth = (node, depth = 1) => {
  if (!node.expanded || node.children.length < 1) return depth;
  depth = depth + node.children.length;
  return node.children.reduce((deeper, node) => getExpandedDepth(node, deeper), depth);
};

const getNextNotSequent = (node, children) => {
  if (!get(node, 'is_sequent')) return node;
  const index = findIndex(children, { id: node.id });
  return getNextNotSequent(children[index + 1], children);
};

export const isSameLevel = (node, nextNode) => {
  const nodeParentId = get(node, 'parentNode.id', null);
  const nextParentId = get(nextNode, 'parentNode.id', null);
  return nodeParentId === nextParentId;
};

export const getIntermediateNodes = (firstNode, secondNode, tree) => {
  const flatData = getFlatData(tree);
  const firstIndex = findIndex(flatData, { node: { id: firstNode.node.id } });
  const secondIndex = findIndex(flatData, { node: { id: secondNode.node.id } });
  const minIndex = Math.min(firstIndex, secondIndex);
  const maxIndex = Math.max(firstIndex, secondIndex);
  const sliceArray = flatData.slice(minIndex, maxIndex + 1);
  let sequentArray = [];
  for (let i = 0; i < sliceArray.length; i++) {
    const currentNode = sliceArray[i];
    if (firstNode.node.id === currentNode.node.id) {
      sequentArray.push(currentNode);
      continue;
    }
    if (secondNode.node.id === currentNode.node.id) {
      sequentArray.push(currentNode);
      continue;
    }
    if (isSameLevel(currentNode, firstNode)) sequentArray.push(currentNode);
  }
  return sequentArray;
};

export const getNodeNeighbors = (idNode, treeData, notSequent = false) => {
  const el = getNodeById(idNode, treeData);
  const children = get(el, 'parentNode.children', []);
  const arr = children.length ? children : treeData;
  const index = findIndex(arr, { id: idNode });
  const next = notSequent ? getNextNotSequent(arr[index + 1], children) : arr[index + 1];
  return {
    prev: arr[index - 1],
    current: arr[index],
    next,
  };
};

export const moveNodeToPervNeighbor = (node, treeData) => {
  const { prev } = getNodeNeighbors(node.id, treeData);
  if (!prev) return treeData;
  const el = getNodeById(node.id, treeData);
  treeData = removeNodes([el], treeData);
  const newParent = getNodeById(prev.id, treeData);
  return createNewTask({ treeData, parentKey: last(newParent.path), node: node });
};

export const MoveNodeToPrevParent = (node, treeData) => {
  const el = getNodeById(node.id, treeData);
  const parentNode = get(el, 'parentNode');
  if (!parentNode) return treeData;
  treeData = removeNodes([el], treeData);
  return createNewTask({ treeData, parentKey: parentNode.project_parent_id, node });
};

const getSequents = (node, treeData, sequents = []) => {
  if (!get(node, 'is_sequent')) return sequents;
  sequents.push(node);
  const { next } = getNodeNeighbors(node.id, treeData);
  return getSequents(next, treeData, sequents);
};

export const getNextSequents = (node, treeData) => {
  const { next } = getNodeNeighbors(node.id, treeData);
  if (!next) return [];
  let sequents = getSequents(next, treeData);
  sequents = sequents.map((sequent) => {
    return getNodeById(sequent.id, treeData);
  });
  return sequents;
};

export const removeNodes = (nodes, treeData) => {
  nodes.forEach((node) => {
    treeData = removeNodeAtPath({
      treeData: treeData,
      path: node.path,
      getNodeKey: getNodeKey,
      ignoreCollapsed: false,
    });
  });
  return treeData;
};

export const addNodes = (nodes, treeData, draggedNode, treeIndex) => {
  const parentNodeId = get(getNodeById(draggedNode.id, treeData), 'parentNode.id', null);
  const children = get(getNodeById(draggedNode.id, treeData), 'parentNode.children', []);
  let index = 0;
  if (!children.length) {
    index = treeIndex;
  } else {
    index = findIndex(children, { id: draggedNode.id });
  }
  nodes.forEach((currentNode) => {
    const { node } = currentNode;
    index = index + 1;
    treeData = addNodeUnderIndexParent({
      expandParent: true,
      getNodeKey,
      newNode: node,
      treeData,
      parentKey: parentNodeId,
      index: index,
    }).treeData;
  });

  return treeData;
};

export const getFlatData = (tree) => {
  return getFlatDataFromTree({
    treeData: tree,
    getNodeKey: getNodeKey,
    ignoreCollapsed: false,
  });
};

export const removeAllChecked = (tree, ids) => {
  let initTree = tree;
  let flatData = getFlatData(tree);
  ids.forEach((id) => {
    const node = find(flatData, { node: { id: id } });
    try {
      initTree = removeNodeAtPath({
        treeData: initTree,
        path: node.path,
        getNodeKey: getNodeKey,
        ignoreCollapsed: false,
      });
    } catch (e) {
      return e;
    }
  });
  return initTree;
};

export const validateTaskName = (name) => {
  let nameRegex = /^[\w\W\s\S]{1,2000}$/;
  return nameRegex.test(name);
};

export const createNewTask = ({ treeData, parentKey, node }) => {
  if (!node) node = { name: '', isNew: true, id: v4() };
  return addNodeUnderParent({
    expandParent: true,
    getNodeKey,
    newNode: node,
    treeData,
    parentKey,
  }).treeData;
};

export const deleteNode = (tree, path) => {
  return removeNode({
    treeData: tree,
    path,
    getNodeKey: getNodeKey,
  }).treeData;
};
