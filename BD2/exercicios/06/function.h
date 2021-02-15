

void insert_key(int key);

void show(struct node *root, int);

void delete_node(int x);

void clear();

void search_key(int x);

enum status_key ins(struct node *r, int x, int *y, struct node **u);

int serch_position(int x, int *key_arr, int n);

enum status_key del(struct node *r, int x);