export class TreeNode {
  constructor(value, left, right, position) {
    this.value = value;
    this.left = left;
    this.right = right;
    this.position = position;
    this.firstpos = new Set();
    this.lastpos = new Set();
    this.followpos = new Set();
  }

  remove_left() {
    this.left = null;
  }

  remove_right() {
    this.right = null;
  }
}
